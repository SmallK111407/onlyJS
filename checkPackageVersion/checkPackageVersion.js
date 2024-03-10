// 作者：曉K(https://gitee.com/SmallK111407)
import plugin from '../../lib/plugins/plugin.js'
import common from "../../lib/common/common.js"
import util from 'util'
import { exec } from 'child_process'

/*
更新日志
v1.0.0 该插件通过pnpm list命令获取版本号

v1.0.1 修复优先级过高导致其他插件的版本无法查看的问题，并且将正则写的更加详细

v1.1.0 更新查看全部依赖版本功能

v1.1.1 正则修改，防止发癫
*/

const _path = process.cwd()

export class checkPackageVersion extends plugin {
    constructor() {
        super({
            name: '[onlyJS]查看依赖版本',
            dsc: '查看依赖版本',
            event: 'message',
            priority: 10000,
            rule: [
                {
                    reg: '^#?(查看|查询)(全部|所有)依赖(版本)?$',
                    fnc: 'checkAllPackageVersion'
                },
                {
                    reg: '^#?(查看|查询)(.*)版本$',
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
    async checkAllPackageVersion() {
        try {
            const execPromise = util.promisify(exec);
            const { stdout } = await execPromise('pnpm list');
            const lines = stdout.split('\n');
            let processingDependencies = false;
            let dependencyVersions = [];
            for (const line of lines) {
                if (line.startsWith('dependencies:') || line.startsWith('devDependencies:')) {
                    processingDependencies = true;
                } else if (processingDependencies) {
                    if (line.trim() === '') {
                        processingDependencies = false;
                    } else {
                        dependencyVersions.push(line.trim());
                    }
                }
            }
            if (dependencyVersions.length === 0) {
                await this.e.reply('似乎没有任何依赖呢？？');
                // 写这行纯属凑的，没依赖怎么启动机器人
                return;
            }
            const msg = dependencyVersions.join('\n');
            let forwardMsg = await common.makeForwardMsg(this.e, [msg], '所有依赖版本如下');
            await this.e.reply(forwardMsg);
        } catch (error) {
            console.error('执行pnpm list发生了错误:', error);
            this.e.reply('执行pnpm list发生了错误，请前往控制台查看报错！');
        }
    }
}