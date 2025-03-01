import { ref, toRaw } from 'vue';
import { FormInstance } from '@arco-design/web-vue';
import allToRaw from '@/utils/allToRaw';
import { deepCopy } from '@/utils/common';

type IOptions<T extends Record<string, unknown>> = {
    defaultState: {
        [P in keyof T]: T[P]
    }
}
export default function useFormHandler<FormType extends Record<string, unknown>>(options: IOptions<FormType>) {
    const { defaultState } = options;
    type FormState = IOptions<FormType>['defaultState']
    const formState = ref<FormState>(deepCopy(defaultState));
    const formRef = ref<FormInstance>();
    return {
        formState,
        formRef,
        resetFields: () => {
            formState.value = deepCopy(defaultState);
        },
        validateFields: () => new Promise<FormState>((resolve, reject) => {
            formRef.value?.validateFields().then((values) => {
                resolve(values as FormState);
            }).catch((err) => {
                reject(err);
            });
        }),
        validateField: (nameList:string) => {
            setTimeout(() => {
                formRef.value?.validateFields(nameList);
            }, 300);
        },
        setFields: (fields:FormState) => {
            const values = allToRaw<FormState>(fields);
            const state = allToRaw(formState);
            // @ts-ignore
            formState.value = {
                ...state,
                ...values
            };
        }
    };
}
