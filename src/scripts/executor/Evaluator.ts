export class Evaluator {
    static evaluate(expr: any, state: { [s: string]: any }) {
        const values = Object.fromEntries(Object.entries(state).map(([k, v]) => [k, Evaluator.extractValues(v)]));

        // Create the environment
        let environment = '';
        for (const [variable, value] of Object.entries(values)) {
            environment += `let ${variable} = ${JSON.stringify(value)};`;
        }

        let value: { status: 'success' | 'error'; data: any } = { status: 'error', data: undefined };

        // Try evaluating the expression
        {
            try {
                value = new Function(
                    `try { ${environment};\n let data = ${expr}; 
                        return {status: "success", data: data}
                     } catch (e) {
                        return {status: "error", data: e.toString()}
                     }`
                )();
            } catch (e) {
                value = { status: 'error', data: e.toString() };
            }
        }

        // if (value.status == "success") {
        //     value.data.values = Evaluator.extractValues(value.data);
        // }

        return value;
    }

    static extractValues(data: { value: any[] }) {
        if (data == null) return null;

        // Find type of data
        let type = typeof data.value;

        if (type == 'object' && Array.isArray(data.value)) {
            return data.value.map((item) => Evaluator.extractValues(item));
        } else {
            return data.value;
        }
    }
}
