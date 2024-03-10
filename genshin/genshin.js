// 作者：曉K(https://gitee.com/SmallK111407)
import plugin from '../../lib/plugins/plugin.js'
import common from '../../lib/common/common.js'
import genshin from 'genshin'

/*
更新日志
v1.0.0 这是一个通过已跑路的依赖写的插件...(突然发现有genshin这个依赖就写了一下...)
npmmirror: https://npmmirror.com/package/genshin

*/

export class GenshinQuery extends plugin {
    constructor() {
        super({
            name: '[onlyJS]GenshinQuery',
            dsc: 'Genshin_Module',
            event: 'message',
            priority: 10,
            rule: [
                {
                    reg: '^#?(genshin|原神)(角色|人物)(.*)$',
                    fnc: 'GenshinQuery'
                }
            ]
        })
    }
    async GenshinQuery() {
        try {
            const msg = this.e.msg.replace(/#|genshin|原神|角色|人物/g, '')
            const jsonStringPromise = genshin.characters(msg)
            const jsonString = await jsonStringPromise
            const jsonData = jsonString
            let forwardMsg = [(`角色名字：` + jsonData.name + `\n` + `出场：` + jsonData.quote + `\n` + `角色CV：` + jsonData.cv + `\n` + `角色描述：` + jsonData.description + `\n` + `角色图片url：` + jsonData.image + `\n` + `角色隶属国家：` + jsonData.city + `\n` + `角色url：` + jsonData.url + `\n` + `角色元素：` + jsonData.element + `\n` + `角色武器类型：` + jsonData.weapon + `\n` + `角色星数：` + jsonData.rating)]
            let resultMsg = await common.makeForwardMsg(this.e, forwardMsg, `点我查看输出结果`)
            await this.e.reply(resultMsg)
            return true
        } catch (error) {
            logger.error(`执行时发生了错误`, error)
            await this.e.reply(`内部发生了错误，可能是没有使用角色英文名导致的...`, true)
            return true
        }
    }
}
