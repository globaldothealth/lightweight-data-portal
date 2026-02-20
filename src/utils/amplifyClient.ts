import {generateClient} from "aws-amplify/data";
import {Schema} from "../../amplify/data/resource.ts";

export const client = generateClient<Schema>({
    authMode: "userPool",
});