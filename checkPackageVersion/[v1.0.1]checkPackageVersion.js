// 作者：曉K(https://gitee.com/SmallK111407)
import plugin from '../../lib/plugins/plugin.js';
import fs from 'node:fs'; // 后续可能会用到fs模块读取
import { exec } from 'child_process'

/*
更新日志
v1.0.0 该插件通过pnpm list命令获取版本号

v1.0.1 修复优先级过高导致其他插件的版本无法查看的问题，并且将正则写的更加详细
*/

const _path = process.cwd()

export class checkPackageVersion extends plugin {
    constructor() {
        super({
            name: '[临时插件]查看依赖版本',
            dsc: '查看版本',
            event: 'message',
            priority: 10000,
            rule: [
                {
                    reg: '^#*(查看|查询)?(.*)版本$',
                    fnc: 'checkPackageVersion'
                }
            ]
        })
    }
    async checkPackageVersion() {
        let msg = this.e.msg
        let packageName = msg.replace(/#|查看|查询|版本/g, '').trim()
        const cmd = `pnpm list ${packageName}`
        const options = {
            cwd: _path
        };
        exec(cmd, options, (error, stdout, stderr) => {
            if (error) {
                console.error(`命令发生了错误,可能是没有安装pnpm或是没有这个依赖`)
                console.error(`错误内容: ${error.message}`)
                this.e.reply(`命令发生了错误,可能是没有安装pnpm或是没有这个依赖`)
                return
            }
            if (stderr) {
                console.error(`STDERR: ${stderr}`)
                return
            }
            const lines = stdout.trim().split('\n');
            const endLine = lines[lines.length - 1];
            let result = endLine.replace(/[^0-9.]/g, '');
            this.e.reply(`${packageName}版本:${result}`)
            return true
        })
    }
}
