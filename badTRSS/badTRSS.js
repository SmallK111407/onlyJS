// 作者：曉K(https://gitee.com/SmallK111407)
import plugin from '../../lib/plugins/plugin.js';

/*
更新日志
v1.0.0 该插件通过“抢优先级”的方式防止时雨偷家

v1.0.1 修改插件名字
*/

//想要允许时雨使用哪些命令呢？ 
//包含allowCommand里的就会尝试执行其他符合正则的方式
const allowCommand = ['关机', '重启', '状态', '椰奶状态', '椰奶状态pro', '撤回', '修改头衔', '申请头衔']

export class badTRSS extends plugin {
    constructor() {
        super({
            name: '[onlyJS]禁止时雨',
            dsc: '时雨好坏！',
            event: 'message',
            priority: -100000000,
            rule: [
                {
                    reg: '.*',
                    fnc: 'badTRSS',
                    log: false
                }
            ]
        })
    }

    async badTRSS() {
        if (this.e.user_id == 2536554304) {
            if (allowCommand.includes(this.e.msg)) {
                return false
            } else {
                return true
            }
        } else {
            return false
        }
    }
}
