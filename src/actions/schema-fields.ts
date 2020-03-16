import _ from "lodash";
import PLANHAT_PROPERTIES from "../core/planhat-properties";
import IFieldsSchema from "../types/fields-schema";

const fieldsSchemaAction = (req: any, res: any) => {
    const type: string = _.get(req, "params.type", "unknown");
    const payload: IFieldsSchema = {
        ok: false,
        error: null,
        options: []
    };
    switch (type) {
        case "contacts":
            _.forIn(PLANHAT_PROPERTIES.CONTACTS, (v: string, k: string) => {
                payload.options.push({ value: k, label: v });
            });
            payload.ok = true;
            break;
        case "companies":
            _.forIn(PLANHAT_PROPERTIES.COMPANIES, (v: string, k: string) => {
                payload.options.push({ value: k, label: v });
            });
            payload.ok = true;
            break;
        default:
            payload.error = `Unrecognized type: "${type}"`;
            break;
    }

    return res.json(payload);
};

export default fieldsSchemaAction;