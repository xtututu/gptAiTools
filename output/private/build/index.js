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
                'refAtt': '参考附件',
                'modelBrand': '迅客'
            },
            'en-US': {
                'modelSelection': 'Model selection',
                'inputCommand': 'Input command',
                'outputResult': 'Output result',
                'refAtt': 'Reference attachment',
                'modelBrand': 'Xunke'
            },
            'ja-JP': {
                'modelSelection': 'モデル選択',
                'inputCommand': '入力コマンド',
                'outputResult': '出力結果',
                'refAtt': '参考附件',
                'modelBrand': 'Xunke'
            }
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
            defaultValue: { label: t('modelBrand') + ' GT-5', value: 'gpt-5' },
            props: {
                options: [
                    // 对话模型 - Gemini 系列
                    { label: t('modelBrand') + ' GM-2.5-pro', value: 'gemini-2.5-pro' },
                    { label: t('modelBrand') + ' GM-3-pro', value: 'gemini-3-pro' },
                    { label: t('modelBrand') + ' GT-5', value: 'gpt-5' },
                    { label: t('modelBrand') + ' GT-5.1', value: 'gpt-5.1' },
                    { label: t('modelBrand') + ' GT-5.2', value: 'gpt-5.2' },
                    { label: t('modelBrand') + ' GT-5-mini', value: 'gpt-5-mini' },
                    { label: t('modelBrand') + ' GT-5-thinking', value: 'gpt-5-thinking' },
                    { label: t('modelBrand') + ' GT-5-nano', value: 'gpt-5-nano' },
                    { label: t('modelBrand') + ' GT-4o-mini', value: 'gpt-4o-mini' },
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
        },
        {
            key: 'refAtt',
            label: t('refAtt'),
            component: block_basekit_server_api_1.FieldComponent.FieldSelect,
            props: {
                supportType: [block_basekit_server_api_1.FieldType.Attachment],
            }
        }
    ],
    // 定义返回结果类型为文本
    resultType: {
        type: block_basekit_server_api_1.FieldType.Text, // 定义捷径的返回结果类型为多行文本字段
    },
    // 执行函数
    execute: async (formItemParams, context) => {
        const { inputCommand, modelSelection, refAtt } = formItemParams;
        const { fetch } = context;
        // 调试日志函数
        function debugLog(arg) {
            // @ts-ignore
            console.log(JSON.stringify({
                timestamp: new Date().toISOString(),
                ...arg
            }));
        }
        try {
            // API请求地址
            const apiUrl = 'https://api.xunkecloud.cn/plus/v1/chat/completions';
            console.log(refAtt);
            // 发送文件上传请求（如果有文件）
            let fileUrl = '';
            if (refAtt && refAtt[0] && refAtt[0].tmp_url) {
                const uploadUrl = 'https://api.xunkecloud.cn/api/file/upload';
                const uploadOptions = {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        file_url: refAtt[0].tmp_url
                    })
                };
                const uploadResponse = await context.fetch(uploadUrl, uploadOptions, 'auth_id_1');
                const uploadResult = await uploadResponse.json();
                console.log('文件上传结果:', uploadResult);
                if (uploadResult.success && uploadResult.file_url) {
                    fileUrl = `https://api.xunkecloud.cn${uploadResult.file_url}`;
                }
            }
            // 构建请求消息
            const messages = [
                {
                    role: 'user',
                    content: [
                        {
                            type: 'text',
                            text: inputCommand
                        },
                        // 添加附件URL（如果存在）
                        ...(fileUrl ? [
                            {
                                type: 'file_url',
                                file_url: {
                                    url: fileUrl
                                }
                            }
                        ] : [])
                    ]
                }
            ];
            // 构建请求配置
            const requestOptions = {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    model: modelSelection.value,
                    messages
                })
            };
            console.log(requestOptions);
            // 发送API请求
            const response = await context.fetch(apiUrl, requestOptions, 'auth_id_1');
            const result = await response.json();
            console.log('API响应:', result);
            // console.log(result.choices[0].message.content);
            // 检查错误
            if (result.error) {
                debugLog({
                    type: 'error',
                    message: result.error.message,
                    code: result.error.code,
                    errorType: result.error.type
                });
                return {
                    code: block_basekit_server_api_1.FieldCode.Success,
                    data: `错误: ${result.error.message}` + '访问查阅处理方式：https://api.xunkecloud.cn/about',
                    msg: result.error.message
                };
            }
            // 返回结果
            const aiResult = result.choices[0].message.content;
            console.log(aiResult);
            return {
                code: block_basekit_server_api_1.FieldCode.Success,
                data: aiResult
            };
        }
        catch (error) {
            console.error('执行错误:', error);
            return {
                code: block_basekit_server_api_1.FieldCode.Success,
                data: 'AI服务异常，请稍后重试～',
                msg: '服务异常！'
            };
        }
    },
});
exports.default = block_basekit_server_api_1.basekit;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvaW5kZXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSxtRkFBOEg7QUFDOUgsTUFBTSxFQUFFLENBQUMsRUFBRSxHQUFHLGdDQUFLLENBQUM7QUFFcEIsYUFBYTtBQUNiLE1BQU0sY0FBYyxHQUFHO0lBQ3JCLG1CQUFtQjtDQUNwQixDQUFDO0FBRUYsY0FBYztBQUNkLGtDQUFPLENBQUMsYUFBYSxDQUFDLGNBQWMsQ0FBQyxDQUFDO0FBRXRDLGtDQUFPLENBQUMsUUFBUSxDQUFDO0lBQ2YsVUFBVTtJQUNWLElBQUksRUFBRTtRQUNKLFFBQVEsRUFBRTtZQUNSLE9BQU8sRUFBRTtnQkFDUCxnQkFBZ0IsRUFBRSxNQUFNO2dCQUN4QixjQUFjLEVBQUUsTUFBTTtnQkFDdEIsY0FBYyxFQUFFLE1BQU07Z0JBQ3RCLFFBQVEsRUFBRSxNQUFNO2dCQUNoQixZQUFZLEVBQUMsSUFBSTthQUNsQjtZQUNBLE9BQU8sRUFBRTtnQkFDUixnQkFBZ0IsRUFBRSxpQkFBaUI7Z0JBQ25DLGNBQWMsRUFBRSxlQUFlO2dCQUMvQixjQUFjLEVBQUUsZUFBZTtnQkFDL0IsUUFBUSxFQUFFLHNCQUFzQjtnQkFDaEMsWUFBWSxFQUFDLE9BQU87YUFFckI7WUFDRCxPQUFPLEVBQUU7Z0JBQ1AsZ0JBQWdCLEVBQUUsT0FBTztnQkFDekIsY0FBYyxFQUFFLFFBQVE7Z0JBQ3hCLGNBQWMsRUFBRSxNQUFNO2dCQUN0QixRQUFRLEVBQUUsTUFBTTtnQkFDaEIsWUFBWSxFQUFDLE9BQU87YUFFckI7U0FDRjtLQUNGO0lBQ0EsY0FBYyxFQUFFO1FBQ2Y7WUFDRSxFQUFFLEVBQUUsV0FBVztZQUNmLFFBQVEsRUFBRSxZQUFZO1lBQ3RCLElBQUksRUFBRSw0Q0FBaUIsQ0FBQyxpQkFBaUI7WUFDekMsUUFBUSxFQUFFLElBQUk7WUFDZCxlQUFlLEVBQUUsZ0NBQWdDO1lBQ2pELEtBQUssRUFBRSxN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