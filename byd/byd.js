// 作者：曉K(https://gitee.com/SmallK111407)
import plugin from "../../lib/plugins/plugin.js";
import common from "../../lib/common/common.js";
/*
更新日志
v1.0.0 这是一个单纯回复的插件,后续会更完善

v1.0.1 新增饮料

v1.0.2 修改插件名字
*/

let CD = {}
export class byd extends plugin {
    constructor() {
        super({
            name: "[onlyJS]byd",
            dsc: "小卖部宇宙",
            event: "message",
            priority: 10,
            rule: [
                {
                    reg: "^#?(阿牛|牛|溜子|铁蛋|愣子|龙哥)(，|,)?(给我)?(来|泡|整)个(三鲜伊面|白象|白象方便面|鸡蛋面|番茄鸡蛋面|熊毅武)$",
                    fnc: "instantNoodle"
                },
                {
                    reg: "^#?(给我)?来(瓶|罐|听|个)(健力宝|旭日升)$",
                    fnc: "drink"
                }
            ]
        })
    }
    async instantNoodle(e) {
        let cdtime = 30
        if (CD[e.user_id] && !e.isMaster) {
            e.reply('每' + cdtime + '分钟只能溜一次面哦！')
            return true
        }
        CD[e.user_id] = true
        CD[e.user_id] = setTimeout(() => {
            if (CD[e.user_id]) delete CD[e.user_id]
        }, cdtime * 60 * 1000)
        await common.sleep(1000)
        this.e.reply(`触发连招啦！`, true, { at: true })
        await common.sleep(1000)
        this.e.reply(`(取铝盒和筷子ing)`)
        await common.sleep(1000)
        let noodleName = e.msg.replace(/阿牛|牛|溜子|铁蛋|愣子|龙哥|，|,|给我|来|泡|整|个/g, '')
        this.e.reply(`(取${noodleName}，并撕开其包装及调料包放进铝盒中ing)`)
        await common.sleep(1000)
        this.e.reply(`(倒开水ing)`)
        await common.sleep(2000)
        this.e.reply(`等两分钟啊`, true, { at: true })
        await common.sleep(120000)
        this.e.reply(`(转头看时钟ing)`)
        await common.sleep(1200)
        this.e.reply(`面好了！！！`, true, { at: true })
    /** await common.sleep(60000)
        this.e.reply(`一块嗷`, true, { at: true }) */
    }
    async drink(e) {
        let cdtime = 5
        if (CD[e.user_id] && !e.isMaster) {
            e.reply('每' + cdtime + '分钟只能饮一次哦！')
            return true
        }
        CD[e.user_id] = true
        CD[e.user_id] = setTimeout(() => {
            if (CD[e.user_id]) delete CD[e.user_id]
        }, cdtime * 60 * 1000)
        await common.sleep(1000)
        this.e.reply(`(转头ing)`)
        await common.sleep(2000)
        let drinkName = e.msg.replace(/给我|来|瓶|罐|听|个/g, '')
        this.e.reply(`(取${drinkName}ing)`)
        await common.sleep(2000)
        this.e.reply(`给！`, true, { at: true })
    }
}