import Joi from "joi";

const ExportNotesPayloadSchema = Joi.object({
  targetEmail: Joi.string().required().email({tlds:true})

})

export default ExportNotesPayloadSchema