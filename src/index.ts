import { basekit, FieldType, field, FieldComponent, FieldCode,AuthorizationType } from '@lark-opdev/block-basekit-server-api';
const { t } = field;

// 配置允许的服务商域名
const allowedDomains = [
  'api.xunkecloud.cn'
];

// 添加服务商域名到白名单
basekit.addDomainList(allowedDomains);

basekit.addField({
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
      type: AuthorizationType.HeaderBearerToken,
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
      component: FieldComponent.SingleSelect,
      defaultValue: { label: 'gpt-5', value: 'gpt-5'},
      props: {
        options: [
          { label: 'gpt-5', value: 'gpt-5'},
          { label: 'gpt-5-mini', value: 'gpt-5-mini'},
          { label: 'gpt-5-thinking', value: 'gpt-5-thinking'},
          { label: 'gpt-5-nano', value: 'gpt-5-nano'},
          { label: 'gpt-4o-mini', value: 'gpt-4o-mini'},
        ]
      },
    },
    {
      key: 'inputCommand',
      label: t('inputCommand'),
      component: FieldComponent.Input,
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
    type: FieldType.Object,
    extra: {
      icon: {
        light: 'https://lf3-static.bytednsdoc.com/obj/eden-cn/eqgeh7upeubqnulog/chatbot.svg',
      },
      properties: [
        {
          key: 'id',
          isGroupByKey: true,// 要有个isGroupByKey
          type: FieldType.Text,
          title: 'id',
          hidden: true
        },
        {
          key: 'outRes',
          type: FieldType.Text,
          title: t('outputResult'),
          primary:true
        },
       
      ],
    },
  },
  // 执行函数
  execute: async (formItemParams, context) => {
    const { inputCommand,modelSelection } = formItemParams;
    const { fetch } = context;

     function debugLog(arg: any) {
      // @ts-ignore
      console.log(JSON.stringify({
        timestamp: new Date().toISOString(),
        ...arg
      }))
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
              code: FieldCode.Success,
              data: {
                id: '-',
                outRes: `错误: ${initialResult.error.message}`
              },
              msg: initialResult.error.message
            };
          }
      let aiResult = initialResult.choices[0].message.content;
      return {
        code: FieldCode.Success,
        data: {// 这里的属性与resultType中的结构对应
          id: '-',
          outRes: aiResult,
          // number: 0,
        },
      };
    } catch (error) {
      console.log("🚀 ~ execute: ~ 整体执行错误:", error);
      return {
        code: FieldCode.Success,
        data: "AI服务异常，请稍后重试～",
        msg: "服务异常！"
      };
    }
  },
});

export default basekit;