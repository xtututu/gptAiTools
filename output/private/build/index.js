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
                'inputCommand': '输入指令',
                'outputResult': '输出结果',
            },
            'en-US': {
                'inputCommand': 'Input command',
                'outputResult': 'Output result',
            },
            'ja-JP': {
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
                // {
                //   key: 'outputResult',
                //   type: FieldType.Text,
                //   title: t('outputResult'),
                //   primary:true
                // }
            ],
        },
    },
    // 执行函数
    execute: async (formItemParams, context) => {
        const { inputCommand } = formItemParams;
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
                    model: 'gpt-5',
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvaW5kZXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSxtRkFBOEg7QUFDOUgsTUFBTSxFQUFFLENBQUMsRUFBRSxHQUFHLGdDQUFLLENBQUM7QUFFcEIsYUFBYTtBQUNiLE1BQU0sY0FBYyxHQUFHO0lBQ3JCLG1CQUFtQjtDQUNwQixDQUFDO0FBRUYsY0FBYztBQUNkLGtDQUFPLENBQUMsYUFBYSxDQUFDLGNBQWMsQ0FBQyxDQUFDO0FBRXRDLGtDQUFPLENBQUMsUUFBUSxDQUFDO0lBQ2YsVUFBVTtJQUNWLElBQUksRUFBRTtRQUNKLFFBQVEsRUFBRTtZQUNSLE9BQU8sRUFBRTtnQkFDUCxjQUFjLEVBQUUsTUFBTTtnQkFDdEIsY0FBYyxFQUFFLE1BQU07YUFDdkI7WUFDRCxPQUFPLEVBQUU7Z0JBQ1AsY0FBYyxFQUFFLGVBQWU7Z0JBQy9CLGNBQWMsRUFBRSxlQUFlO2FBQ2hDO1lBQ0QsT0FBTyxFQUFFO2dCQUNQLGNBQWMsRUFBRSxRQUFRO2dCQUN4QixjQUFjLEVBQUUsTUFBTTthQUN2QjtTQUNGO0tBQ0Y7SUFDQSxjQUFjLEVBQUU7UUFDZjtZQUNFLEVBQUUsRUFBRSxXQUFXO1lBQ2YsUUFBUSxFQUFFLFlBQVk7WUFDdEIsSUFBSSxFQUFFLDRDQUFpQixDQUFDLGlCQUFpQjtZQUN6QyxRQUFRLEVBQUUsSUFBSTtZQUNkLGVBQWUsRUFBRSxnQ0FBZ0M7WUFDakQsS0FBSyxFQUFFLE1BQU07WUFDYixJQUFJLEVBQUU7Z0JBQ0osS0FBSyxFQUFFLEVBQUU7Z0JBQ1QsSUFBSSxFQUFFLEVBQUU7YUFDVDtTQUNGO0tBQ0Y7SUFDRCxVQUFVO0lBQ1YsU0FBUyxFQUFFO1FBQ1Q7WUFDRSxHQUFHLEVBQUUsY0FBYztZQUNuQixLQUFLLEVBQUUsQ0FBQyxDQUFDLGNBQWMsQ0FBQztZQUN4QixTQUFTLEVBQUUseUNBQWMsQ0FBQyxLQUFLO1lBQy9CLEtBQUssRUFB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