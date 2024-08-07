import { nanoid } from 'nanoid';
import pg from 'pg';
import mapDBToModel from '../../utils/index.js';
import NotFoundError from '../../exceptions/NotFoundError.js';
import InvariantError from '../../exceptions/InvariantError.js';
import AuthorizationError from '../../exceptions/AuthorizationError.js';

class NotesService {
  constructor(collaborationService) {
    this._pool = new pg.Pool();
    this._collaborationService = collaborationService;
  }

  async addNote({ title, body, tags,owner }) {
    const id = nanoid(16);
    const createdAt = new Date().toISOString();
    const updatedAt = createdAt;
    const query = {
      text: 'insert into notes values($1, $2, $3, $4, $5, $6, $7) returning id',
      values: [id, title, body, tags, createdAt, updatedAt, owner],
    };
    const result = await this._pool.query(query);
    if (!result.rows[0].id) {
      throw new InvariantError('Catatan gagal ditambahkan');
    }
    return result.rows[0].id;
  }

  async getNotes(owner) {
    const query = {
      text: 'select notes.* from notes left join collaborations ON collaborations.note_id = notes.id where owner = $1 OR collaborations.user_id = $1 group by notes.id',
      values: [owner],
    };
    const result = await this._pool.query(query);
    return result.rows.map(mapDBToModel);
  }

  async getNoteById(id) {
    const query = {
      text: `SELECT notes.*, users.username
      FROM notes
      LEFT JOIN users ON users.id = notes.owner
      WHERE notes.id = $1`,
      values: [id],
    };
    const result = await this._pool.query(query);
   
    if (!result.rows.length) {
      throw new NotFoundError('Catatan tidak ditemukan');
    }
   
    return result.rows.map(mapDBToModel)[0];
  }
  

  async editNoteById(id, { title, body, tags }) {
    const updatedAt = new Date().toISOString();
    const query = {
      text: 'Update notes set title = $1, body = $2, tags = $3, updated_at = $4 where id = $5 returning id',
      values: [title, body, tags, updatedAt, id],
    };
    const result = await this._pool.query(query);
    if (!result.rows.length) {
      throw new NotFoundError('Gagal memperbarui catatan. Id tidak ditemukan');
    }
  }

  async deleteNoteById(id) {
    const query = {
      text: 'Delete from notes where id = $1 returning id',
      values: [id],
    };
    const result = await this._pool.query(query);
    if (!result.rows.length) {
      throw new NotFoundError('Catatan gagal dihapus. Id tidak ditemukan');
    }
  }
  async verifyNoteOwner(id, owner) {
    const query = {
      text :'select * from notes where id =$1',
      values: [id],
    };
    const result = await this ._pool.query(query);
    if (!result.rows.length) {
      throw new NotFoundError('Catatan tidak ditemukan');
    }
    const note = result.rows[0];
    if (note.owner !== owner) {
      throw new AuthorizationError('Anda tidak berhak mengakses resource ini');
    }
  }
  async verifyNoteAccess(noteId, userId) {
    try{
      await this.verifyNoteOwner(noteId, userId)
    }catch(error){
      if(error instanceof NotFoundError){
        throw error
      }
    }
    try{
      await this._collaborationService.verifyCollaborator(noteId, userId)
    } catch(error){
      throw error
    }
  }
}

export default NotesService;
