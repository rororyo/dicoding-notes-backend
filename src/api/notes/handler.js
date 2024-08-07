import ClientError from "../../exceptions/ClientError.js";

class NotesHandler {
  constructor(service, validator) {
    this._service = service;
    this._validator = validator;
    this.postNoteHandler = this.postNoteHandler.bind(this);
    this.getNotesHandler = this.getNotesHandler.bind(this);
    this.getNoteByIdHandler = this.getNoteByIdHandler.bind(this);
    this.putNoteByIdHandler = this.putNoteByIdHandler.bind(this);
    this.deleteNoteByIdHandler = this.deleteNoteByIdHandler.bind(this);
  }

  async postNoteHandler(request, h) {
    try {
      this._validator.validateNotePayload(request.payload);
      const { title = "untitled", body, tags } = request.payload;
      const { id: credentialId } = request.auth.credentials;
      const noteId = await this._service.addNote({
        title,
        body,
        tags,
        owner: credentialId,
      });

      const response = h.response({
        status: "success",
        message: "Catatan berhasil ditambahkan",
        data: {
          noteId,
        },
      });
      response.code(201);
      return response;
    } catch (err) {
      if (err instanceof ClientError) {
        const response = h.response({
          status: "fail",
          message: err.message,
        });
        response.code(err.statusCode);
        return response;
      }
      const response = h.response({
        status: "error",
        message: "Maaf, terjadi kegagalan pada server kami.",
      });
      response.code(500);
      console.error(err);
      return response;
    }
  }

  async getNotesHandler(request) {
    try {
      const { id } = request.params;
      const { id: credentialId } = request.auth.credentials;
      await this._service.verifyNoteOwner(id, credentialId);
      const notes = await this._service.getNotes();
      return {
        status: "success",
        data: {
          notes,
        },
      };
    } catch (err) {
      if (err instanceof ClientError) {
        const response = h.response({
          status: "fail",
          message: err.message,
        });
        response.code(err.statusCode);
        return response;
      }
      const response = h.response({
        status: "error",
        message: "Maaf, terjadi kegagalan pada server kami.",
      });
      response.code(500);
      console.error(err);
      return response;
    }
  }

  async getNoteByIdHandler(request, h) {
    const { id } = request.params;
    const { id: credentialId } = request.auth.credentials;
 
    await this._service.verifyNoteAccess(id, credentialId);
    const note = await this._service.getNoteById(id);
    return {
      status: 'success',
      data: {
        note,
      },
    };
  }

  async putNoteByIdHandler(request, h) {
    this._validator.validateNotePayload(request.payload);
    const { id } = request.params;
    const { id: credentialId } = request.auth.credentials;
 
    await this._service.verifyNoteAccess(id, credentialId);
    await this._service.editNoteById(id, request.payload);
    return {
      status: 'success',
      message: 'Catatan berhasil diperbarui',
    };
  }

  async deleteNoteByIdHandler(request, h) {
    try{
    const { id } = request.params;
    const { id: credentialId } = request.auth.credentials;
    await this._service.verifyNoteOwner(id,credentialId)
    await this._service.deleteNoteById(id);

    return {
      status: "success",
      message: "Catatan berhasil dihapus",
    };
    }
    catch(err){
      if (err instanceof ClientError) {
        const response = h.response({
          status: "fail",
          message: err.message,
        });
        response.code(err.statusCode);
        return response;
      }
      const response = h.response({
        status: "error",
        message: "Maaf, terjadi kegagalan pada server kami.",
      });
      response.code(500);
      console.error(err);
      return response;
    } 

  }
}

export default NotesHandler;
