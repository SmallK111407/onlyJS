//项目作者: @梁氏(https://gitee.com/liangshi233)
//项目地址: https://gitee.com/liangshi233/liangshi-calc
//本插件作者: @曉K(https://gitee.com/SmallK111407)
import plugin from '../../lib/plugins/plugin.js'
import fs from 'node:fs'
import path from 'path'
import { execSync } from 'child_process'

const _path = process.cwd()

export class allSetting extends plugin {
    constructor() {
        super({
            name: '[onlyJs]启动梁氏',
            dsc: '玩原神玩的',
            event: 'message',
            priority: 10,
            rule: [
                {
                    reg: '^#?梁氏(安装|下载|克隆)$',
                    fnc: 'liangshiClone'
                },
                {
                    reg: '^#?梁氏(跑路|卸载|再见|拜拜)$',
                    fnc: 'liangshiDelete'
                },
                {
                    reg: '^#?梁氏([，,])?启动([！!])?$',
                    fnc: 'liangshiStart'
                },
                {
                    reg: '^#?梁氏(恢复|复)(原|原有|原来的)?配置(文件)?$',
                    fnc: 'liangshiByebye'
                }
            ]
        })
    }
    async liangshiClone() {
        /** 不是主人则阻挡不再往下执行 */
        if (!this.e.isMaster) { return true }
        /** 定义路径变量 */
        const liangshi = path.join(`${_path}/plugins`, `liangshi-calc`)
        /** 检查是否又梁氏插件 */
        if (!fs.existsSync(liangshi)) {
            await this.e.reply(`正在尝试克隆梁氏插件...`)
            const cmd = `git clone --depth=1 https://gitee.com/liangshi233/liangshi-calc.git ./plugins/liangshi-calc/`
            const options = {
                cwd: _path
            };
            /** 安装 */
            try {
                /** 成功返回 */
                execSync(cmd, options);
                this.e.reply(`梁氏插件克隆成功！\n发送【#梁氏启动】来启用梁氏插件吧！`)
                return true
                /** 如果clone失败 */
            } catch (error) {
                console.error(`命令发生了错误`)
                console.error(`错误内容: ${error.message}`)
                this.e.reply(`命令发生了错误,可能是克隆失败或是没有git或是内存不足等`)
                return
            }
        } else {
            await this.e.reply(`您已经安装过了！请勿重复安装啦！！！`, true)
            return true
        }
    }
    async liangshiDelete() {
        /** 不是主人则阻挡不再往下执行 */
        if (!this.e.isMaster) { return true }
        const liangshijs = `${_path}/plugins/example/[js]liangshiStart.js`
        if (!fs.existsSync(liangshijs)) {
            await this.e.reply(`似乎删除不了本插件呢，请不要把本插件改名哦，否则会删除失败`, true)
        } else {
            fs.unlink(liangshijs, (err) => {
                if (err) throw err;
                this.e.reply(`已将本插件删除啦！有缘再见！\n请重启生效！`, true)
            });
        }
    }
    async liangshiStart() {
        /** 不是主人则阻挡不再往下执行 */
        if (!this.e.isMaster) { return true }
        /** 检测梁氏 */
        const liangshi = path.join(`${_path}/plugins`, `liangshi-calc`)
        if (!fs.existsSync(liangshi)) {
            await this.e.reply(`诶诶，好像还没安装梁氏插件呢！\n发送【#梁氏安装】获取梁氏插件吧！`)
        }
        /** 备份原文件，防止后悔 */
        const liangshiData = path.join(`${_path}/data`, `liangshiData`)
        if (!fs.existsSync(liangshiData)) {
            fs.mkdirSync(liangshiData)
        }
        /** 定义 */
        const miaoFile0 = path.join(`${_path}/plugins/miao-plugin/config`, `cfg.js`)
        const miaoFile1 = path.join(`${_path}/plugins/miao-plugin/config/system`, `cfg_system.js`)
        const miaoFile2 = path.join(`${_path}/plugins/miao-plugin/models`, `ProfileDmg.js`)
        /** 定义 */
        const dataFile0 = path.join(`${_path}/data/liangshiData`, `cfg.js`)
        const dataFile1 = path.join(`${_path}/data/liangshiData`, `cfg_system.js`)
        const dataFile2 = path.join(`${_path}/data/liangshiData`, `ProfileDmg.js`)
        /** 检查是否已经备份过原文件(cv from Useless-Plugin) */
        if (!fs.existsSync(dataFile1)) {
            /** 备份文件 */
            fs.copyFile(miaoFile0, dataFile0, (err) => {
                if (err) throw err;
            })
            fs.copyFile(miaoFile1, dataFile1, (err) => {
                if (err) throw err;
            })
            fs.copyFile(miaoFile2, dataFile2, (err) => {
                if (err) throw err;
            })
            /** 定义 */
            const liangshiFile1 = path.join(`${_path}/plugins/liangshi-calc/replace`, `cfg_system.js`)
            const liangshiFile2 = path.join(`${_path}/plugins/liangshi-calc/replace`, `ProfileDmg.js`)
            /** 写入新配置 */
            fs.copyFile(liangshiFile1, miaoFile1, (err) => {
                if (err) throw err;
            })
            fs.copyFile(liangshiFile2, miaoFile2, (err) => {
                if (err) throw err;
            })
            await this.e.reply(`已保存原配置文件至云崽根目录/data/liangshiData内！\n请重启机器人以启用梁氏！\n重启后发送【#喵喵设置】查看新设置！\n如果反悔了想恢复原来的请发送\n【#梁氏恢复配置】`, true)
            return true
        } else {
            await this.e.reply(`已经备份过了！请勿重复备份！`, true)
            return true
        }
        /** 写入开关 */
        /* byd跟着readme多写的东西👇👇👇
        fs.readFile(`${_path}/plugins/miao-plugin/config/cfg.js`, 'utf8', function (err, data) {
            if (err) throw err;
            const teamLiang = `\n// 梁氏开关\nexport const teamLiang = true`;
            const position = data.indexOf('export const artisNumber = ');
            const endPosition = data.indexOf('\n', position);
            const newData = data.slice(0, endPosition + 1) + teamLiang + '\n' + data.slice(endPosition + 1);
            fs.writeFile(`${_path}/plugins/miao-plugin/config/cfg.js`, newData, function (err) {
                if (err) throw err;
            })
        })
        */
    }
    async liangshiByebye() {
        /** 不是主人则阻挡不再往下执行 */
        if (!this.e.isMaster) { return true }
        /** 检查是否已备份 */
        const liangshiData = path.join(`${_path}/data`, `liangshiData`)
        if (!fs.existsSync(liangshiData)) {
            await this.e.reply(`你似乎还没备份过哦~`, true)
            return true
        }
        /** 定义 */
        const miaoFile0 = path.join(`${_path}/plugins/miao-plugin/config`, `cfg.js`)
        const miaoFile1 = path.join(`${_path}/plugins/miao-plugin/config/system`, `cfg_system.js`)
        const miaoFile2 = path.join(`${_path}/plugins/miao-plugin/models`, `ProfileDmg.js`)
        /** 定义 */
        const dataFile0 = path.join(`${_path}/data/liangshiData`, `cfg.js`)
        const dataFile1 = path.join(`${_path}/data/liangshiData`, `cfg_system.js`)
        const dataFile2 = path.join(`${_path}/data/liangshiData`, `ProfileDmg.js`)
        /** 写入原文件 */
        if (fs.existsSync(dataFile1)) {
            fs.copyFile(dataFile0, miaoFile0, (err) => {
                if (err) throw err;
            })
            fs.copyFile(dataFile1, miaoFile1, (err) => {
                if (err) throw err;
            })
            fs.copyFile(dataFile2, miaoFile2, (err) => {
                if (err) throw err;
            })
            /** 删除liangshiData */
            const liangshiData = path.join(`${_path}/data`, `liangshiData`);
            if (fs.existsSync(liangshiData) && fs.lstatSync(liangshiData).isDirectory()) {
                const files = fs.readdirSync(liangshiData);
                /** 因文件夹内存在文件，不能直接删除，需采用递归删除法 */
                files.forEach(file => {
                    const currentPath = path.join(liangshiData, file);
                    if (fs.lstatSync(currentPath).isDirectory()) {
                        const subFiles = fs.readdirSync(currentPath);
                        subFiles.forEach(subFile => {
                            const subFilePath = path.join(currentPath, subFile);
                            fs.unlinkSync(subFilePath);
                        });
                        fs.rmdirSync(currentPath);
                    } else {
                        fs.unlinkSync(currentPath);
                    }
                });
                /** 删除liangshiData文件夹 */
                fs.rmdirSync(liangshiData);
                await this.e.reply(`梁氏要跟你说拜拜啦~`, true);
                return true
            }
        }
        await this.e.reply(`你似乎还没有过任何备份呢？`, true)
        return true
    }
}