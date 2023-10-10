// 作者：曉K(https://gitee.com/SmallK111407)
import plugin from "../../lib/plugins/plugin.js";
import common from "../../lib/common/common.js";
/*
更新日志
v1.0 更新 输出指定at人的性别

v1.1 更新 如果没有at人则执行随机性别

v1.2 更新 修复如果前面为空，则不继续往下执行

v1.3 更新 更多的性别！

v1.3.5 新增 指定人输出萝莉

v1.3.6 修改插件名字和正则

v1.3.7 修复TRSS-Yunzai
*/

//沃尔玛购物袋名单
const WalmartBag = [123456, 2302777307]
//萝莉名单
const Loli = [114514, 1509293009]

export class isBoyrOrGirl extends plugin {
    constructor() {
        super({
            name: "[onlyJS]看看TA是男的还是女的",
            dsc: "看看TA是男的还是女的",
            event: "message",
            priority: 10,
            rule: [
                {
                    reg: "^#?(.*)男的女的？?",
                    fnc: "isBoyrOrGirl"
                }
            ]
        })
    }
    async isBoyrOrGirl() {
        if (!this.e.at) {
            let msg = this.e.msg
            let result = msg.replace(/#|男的女的/g, '')
            if (result === "") {
                this.e.reply(`你在问谁呢？`)
            } else {
                this.e.reply(`【${result}】这么可爱`)
                await common.sleep(2000)
                this.e.reply(`让我猜猜看，TA的性别一定是...`)
                let randomIndex = Math.ceil(Math.random() * 15)
                console.log(randomIndex)
                // 性别来自推特、Facebook等平台
                if (randomIndex === 1) {
                    await common.sleep(2000)
                    this.e.reply(`男生！`)
                } else if (randomIndex === 2) {
                    await common.sleep(2000)
                    this.e.reply(`女生！`)
                } else if (randomIndex === 3) {
                    await common.sleep(2000)
                    this.e.reply(`沃尔玛购物袋！`)
                } else if (randomIndex === 4) {
                    await common.sleep(2000)
                    this.e.reply(`双性人！`)
                } else if (randomIndex === 5) {
                    await common.sleep(2000)
                    this.e.reply(`人妖！`)
                } else if (randomIndex === 6) {
                    await common.sleep(2000)
                    this.e.reply(`萝莉！`)
                } else if (randomIndex === 7) {
                    await common.sleep(2000)
                    this.e.reply(`无性人！`)
                } else if (randomIndex === 8) {
                    await common.sleep(2000)
                    this.e.reply(`变性人！`)
                } else if (randomIndex === 9) {
                    await common.sleep(2000)
                    this.e.reply(`跨性人！`)
                } else if (randomIndex === 10) {
                    await common.sleep(2000)
                    this.e.reply(`两魂人！`)
                } else if (randomIndex === 11) {
                    await common.sleep(2000)
                    this.e.reply(`武装直升机！`)
                } else if (randomIndex === 12) {
                    await common.sleep(2000)
                    this.e.reply(`间性人！`)
                } else if (randomIndex === 13) {
                    await common.sleep(2000)
                    this.e.reply(`外性人！`)
                } else if (randomIndex === 14) {
                    await common.sleep(2000)
                    this.e.reply(`泛性人！`)
                } else if (randomIndex === 15) {
                    await common.sleep(2000)
                    this.e.reply(`呃...TA的性别我也不会描述！！！`)
                }
            }
        } else {
            let member = await this.e.group.pickMember(this.e.at).getInfo()
            let name = member.card ? member.card : member.nickname ? member.nickname : member.user_id
            if (WalmartBag.includes(member.user_id)) {
                this.e.reply(`【${name}】这么可爱`)
                await common.sleep(2000)
                this.e.reply(`TA的性别一定是...`)
                await common.sleep(2000)
                this.e.reply(`沃尔玛购物袋！`)
                return true
            } else if (Loli.includes(member.user_id)) {
                this.e.reply(`【${name}】这么可爱`)
                await common.sleep(2000)
                this.e.reply(`TA的性别一定是...`)
                await common.sleep(2000)
                this.e.reply(`萝莉！`)
                return true
            } else {
                if (this.e.at) {
                    this.e.reply(`【${name}】这么可爱`)
                    await common.sleep(2000)
                    this.e.reply(`TA的性别一定是...`)
                    await common.sleep(2000)
                    this.e.reply(`${member.sex == 'male' ? '男生哦！' : member.sex == 'female' ? '女生哦！' : '我也不知道啦！'}`)
                }
                return true
            }
        }
    }
}