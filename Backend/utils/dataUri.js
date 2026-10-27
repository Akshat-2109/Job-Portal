import DataUriParser from "datauri/parser.js";
import path from "path";

const parser = new DataUriParser();

const getDataUri = (file) => {
  const extension = path.extname(file.originalname).toString();
  return parser.format(extension, file.buffer);
};

export default getDataUri;
