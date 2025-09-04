"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const block_basekit_server_api_1 = require("@lark-opdev/block-basekit-server-api");
const { t } = block_basekit_server_api_1.field;
// 配置允许的服务商域名
const allowedDomains = [
    'api.xunkecloud.cn'
];
// 添加服务商域名到白名单
block_basekit_server_api_1.basekit.addDomainList(allowedDomains);
block_basekit_server_api_1.basekit.addField({
    // 定义多语言支持
    i18n: {
        messages: {
            'zh-CN': {
                'modelSelection': '选择模型',
                'inputCommand': '输入指令',
                'outputResult': '输出结果',
            },
            'en-US': {
                'modelSelection': 'Model selection',
                'inputCommand': 'Input command',
                'outputResult': 'Output result',
            },
            'ja-JP': {
                'modelSelection': 'モデル選択',
                'inputCommand': '入力コマンド',
                'outputResult': '出力結果',
            },
        }
    },
    authorizations: [
        {
            id: 'auth_id_1',
            platform: 'xunkecloud',
            type: block_basekit_server_api_1.AuthorizationType.HeaderBearerToken,
            required: true,
            instructionsUrl: "http://api.xunkecloud.cn/login",
            label: '关联账号',
            icon: {
                light: '',
                dark: ''
            }
        }
    ],
    // 定义捷径的入参
    formItems: [
        {
            key: 'modelSelection',
            label: t('modelSelection'),
            component: block_basekit_server_api_1.FieldComponent.SingleSelect,
            defaultValue: { label: 'gpt-5', value: 'gpt-5' },
            props: {
                options: [
                    { label: 'gpt-5', value: 'gpt-5' },
                    { label: 'gpt-5-mini', value: 'gpt-5-mini' },
                    { label: 'gpt-5-thinking', value: 'gpt-5-thinking' },
                    { label: 'gpt-5-nano', value: 'gpt-5-nano' },
                    { label: 'gpt-4o-mini', value: 'gpt-4o-mini' },
                ]
            },
        },
        {
            key: 'inputCommand',
            label: t('inputCommand'),
            component: block_basekit_server_api_1.FieldComponent.Input,
            props: {
                placeholder: '请输入指令',
            },
            validator: {
                required: true,
            }
        }
    ],
    // 定义返回结果类型为文本
    resultType: {
        type: block_basekit_server_api_1.FieldType.Object,
        extra: {
            icon: {
                light: 'https://lf3-static.bytednsdoc.com/obj/eden-cn/eqgeh7upeubqnulog/chatbot.svg',
            },
            properties: [
                {
                    key: 'id',
                    isGroupByKey: true, // 要有个isGroupByKey
                    type: block_basekit_server_api_1.FieldType.Text,
                    title: 'id',
                    hidden: true
                },
                {
                    key: 'outRes',
                    type: block_basekit_server_api_1.FieldType.Text,
                    title: t('outputResult'),
                    primary: true
                },
            ],
        },
    },
    // 执行函数
    execute: async (formItemParams, context) => {
        const { inputCommand, modelSelection } = formItemParams;
        const { fetch } = context;
        function debugLog(arg) {
            // @ts-ignore
            console.log(JSON.stringify({
                timestamp: new Date().toISOString(),
                ...arg
            }));
        }
        try {
            const createVideoUrl = `http://api.xunkecloud.cn/v1/chat/completions`;
            // 打印API调用参数信息
            const requestOptions = {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    model: modelSelection.value,
                    "messages": [
                        {
                            "role": "developer",
                            "content": "你是一个有帮助的助手。"
                        },
                        {
                            "role": "user",
                            "content": inputCommand
                        }
                    ]
                })
            };
            const taskResp = await context.fetch(createVideoUrl, requestOptions, 'auth_id_1');
            const initialResult = await taskResp.json();
            // 检查是否有错误
            if (initialResult.error) {
                debugLog({
                    type: 'error',
                    message: initialResult.error.message,
                    code: initialResult.error.code,
                    errorType: initialResult.error.type
                });
                return {
                    code: block_basekit_server_api_1.FieldCode.Success,
                    data: {
                        id: '-',
                        outRes: `错误: ${initialResult.error.message}`
                    },
                    msg: initialResult.error.message
                };
            }
            let aiResult = initialResult.choices[0].message.content;
            return {
                code: block_basekit_server_api_1.FieldCode.Success,
                data: {
                    id: '-',
                    outRes: aiResult,
                    // number: 0,
                },
            };
        }
        catch (error) {
            console.log("🚀 ~ execute: ~ 整体执行错误:", error);
            return {
                code: block_basekit_server_api_1.FieldCode.Success,
                data: "AI服务异常，请稍后重试～",
                msg: "服务异常！"
            };
        }
    },
});
exports.default = block_basekit_server_api_1.basekit;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvaW5kZXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSxtRkFBOEg7QUFDOUgsTUFBTSxFQUFFLENBQUMsRUFBRSxHQUFHLGdDQUFLLENBQUM7QUFFcEIsYUFBYTtBQUNiLE1BQU0sY0FBYyxHQUFHO0lBQ3JCLG1CQUFtQjtDQUNwQixDQUFDO0FBRUYsY0FBYztBQUNkLGtDQUFPLENBQUMsYUFBYSxDQUFDLGNBQWMsQ0FBQyxDQUFDO0FBRXRDLGtDQUFPLENBQUMsUUFBUSxDQUFDO0lBQ2YsVUFBVTtJQUNWLElBQUksRUFBRTtRQUNKLFFBQVEsRUFBRTtZQUNSLE9BQU8sRUFBRTtnQkFDUCxnQkFBZ0IsRUFBRSxNQUFNO2dCQUN4QixjQUFjLEVBQUUsTUFBTTtnQkFDdEIsY0FBYyxFQUFFLE1BQU07YUFFdkI7WUFDRCxPQUFPLEVBQUU7Z0JBQ1AsZ0JBQWdCLEVBQUUsaUJBQWlCO2dCQUNuQyxjQUFjLEVBQUUsZUFBZTtnQkFDL0IsY0FBYyxFQUFFLGVBQWU7YUFDaEM7WUFDRCxPQUFPLEVBQUU7Z0JBQ1AsZ0JBQWdCLEVBQUUsT0FBTztnQkFDekIsY0FBYyxFQUFFLFFBQVE7Z0JBQ3hCLGNBQWMsRUFBRSxNQUFNO2FBQ3ZCO1NBQ0Y7S0FDRjtJQUNBLGNBQWMsRUFBRTtRQUNmO1lBQ0UsRUFBRSxFQUFFLFdBQVc7WUFDZixRQUFRLEVBQUUsWUFBWTtZQUN0QixJQUFJLEVBQUUsNENBQWlCLENBQUMsaUJBQWlCO1lBQ3pDLFFBQVEsRUFBRSxJQUFJO1lBQ2QsZUFBZSxFQUFFLGdDQUFnQztZQUNqRCxLQUFLLEVBQUUsTUFBTTtZQUNiLElBQUksRUFBRTtnQkFDSixLQUFLLEVBQUUsRUFBRTtnQkFDVCxJQUFJLEVBQUUsRUFBRTthQUNUO1NBQ0Y7S0FDRjtJQUNELFVBQVU7SUFDVixTQUFTLEVBQUU7UUFDVDtZQUNFLEdBQUcsRUFBRSxnQkFBZ0I7WUFDckIs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