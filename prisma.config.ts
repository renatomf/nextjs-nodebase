import "dotenv/config";
import { env } from "@prisma/config";

export default {
  datasource: {
    url: env("DATABASE_URL"),
  },
};

