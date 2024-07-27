import { nanoid } from "nanoid";
import pg from "pg";
import mapDBToModel from "../../utils/index.js";
import NotFoundError from "../../exceptions/NotFoundError.js";
import InvariantError from "../../exceptions/InvariantError.js";
class NotesService {
  constructor() {
    this._pool = new pg.Pool();
  }
  async addNote({ title, body, tags }) {
    const id = nanoid(16);
    const createdAt = new Date().toISOString();
    const updatedAt = createdAt;
    const query = {
      text: "insert into notes values($1, $2, $3, $4, $5, $6) returning id",
      values: [id, title, body, tags, createdAt, updatedAt],
    };
    const result = await this._pool.query(query);
    if (!result.rows[0].id) {
      throw new InvariantError("Catatan gagal ditambahkan");
    }
    return result.rows[0].id;
  }
  async getNotes() {
    const result = await this._pool.query("select * from notes");
    return result.rows.map(mapDBToModel);
  }
  async getNoteById(id){
    const query={
        text: "select * from notes where id = $1",
        values: [id]
    }
    const result = await this._pool.query(query);
    if(!result.rows.length){
        throw new NotFoundError("Catatan tidak ditemukan")
    }
    return result.rows.map(mapDBToModel)[0];
  }
  async editNoteById(id,{title,body,tags}){
    const updatedAt = new Date().toISOString();
    const query = {
        text : 'Update notes set title = $1, body = $2, tags = $3, updated_at = $4 where id = $5 returning id',
        values : [title,body,tags,updatedAt,id]
    }
    const result = await this._pool.query(query);
    if(!result.rows.length){
        throw new NotFoundError("Gagal memperbarui catatan. Id tidak ditemukan");
    }
  }
  async deleteNoteById(id){
    const query = {
        text: 'Delete from notes where id = $1 returning id',
        values: [id]
    }
    const result = await this._pool.query(query);
    if(!result.rows.length){
        throw new NotFoundError("Catatan gagal dihapus. Id tidak ditemukan");
    }
  }
}

export default NotesService