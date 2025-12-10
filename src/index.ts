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
        'refAtt': '参考附件',
      },
       'en-US': {
        'modelSelection': 'Model selection',
        'inputCommand': 'Input command',
        'outputResult': 'Output result',
        'refAtt': 'Reference attachment',
      }, 
      'ja-JP': {
        'modelSelection': 'モデル選択',
        'inputCommand': '入力コマンド',
        'outputResult': '出力結果',
        'refAtt': '参考附件',
      }
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
          { label: 'gpt-5.1', value: 'gpt-5.1'},
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
    },
    {
      key: 'refAtt',
      label: t('refAtt'),
      component: FieldComponent.FieldSelect,
      props: {
        supportType: [FieldType.Attachment],
      }
    }
    
  ],
  // 定义返回结果类型为文本
 resultType: {
    type: FieldType.Text,// 定义捷径的返回结果类型为多行文本字段
  },
  // 执行函数
  execute: async (formItemParams, context) => {
    const { inputCommand, modelSelection, refAtt } = formItemParams;
    const { fetch } = context;

    // 调试日志函数
    function debugLog(arg: any) {
      // @ts-ignore
      console.log(JSON.stringify({
        timestamp: new Date().toISOString(),
        ...arg
      }));
    }

    try {
      // API请求地址
      const apiUrl = 'http://api.xunkecloud.cn/plus/v1/chat/completions';
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

      console.log('requestOptions:', requestOptions);
      
      // 发送API请求
      const response = await context.fetch(apiUrl, requestOptions, 'auth_id_1');
      const result = await response.json();
      
      console.log(result.choices[0].message.content);
      
      // 检查错误
      if (result.error) {
        debugLog({
          type: 'error',
          message: result.error.message,
          code: result.error.code,
          errorType: result.error.type
        });
        
        return {
          code: FieldCode.Success,
          data: {
            id: '-',
            outRes: `错误: ${result.error.message}`
          },
          msg: result.error.message
        };
      }
      
      // 返回结果
      const aiResult = result.choices[0].message.content;
      return {
        code: FieldCode.Success,
        data: aiResult
      };
    } catch (error) {
      console.error('执行错误:', error);
      return {
        code: FieldCode.Success,
        data: 'AI服务异常，请稍后重试～',
        msg: '服务异常！'
      };
    }
  },
});

export default basekit;