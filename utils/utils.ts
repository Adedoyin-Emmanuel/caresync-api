import { v4 as uuidv4 } from "uuid";

const generateLongToken = () => {
  const uuid = uuidv4();

  // more randomness to make the token longer
  const extraRandomData = Math.random().toString(36).substring(2);

  const longToken = uuid + extraRandomData;

  return longToken;
};

export { generateLongToken };
