import plugin from '../../lib/plugins/plugin.js';
import fs from 'node:fs';
import { exec } from 'child_process'

const _path = process.cwd()

export class checkPackageVersion extends plugin {
    constructor() {
        super({
            name: '[临时插件]查看依赖版本',
            dsc: '查看版本',
            event: 'message',
            priority: -100000,
            rule: [
                {
                    reg: '^#*(.*)版本$',
                    fnc: 'checkPackageVersion'
                }
            ]
        })
    }
    async checkPackageVersion() {
        let msg = this.e.msg
        let packageName = msg.replace(/#|版本/g, '').trim()
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
