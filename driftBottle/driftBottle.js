// 作者：曉K(https://gitee.com/SmallK111407)
import plugin from '../../lib/plugins/plugin.js'
import fs from 'node:fs'
import path from 'path'
import moment from 'moment'

/** 数据类配置 */
const throwCDTime = `3` //每几分钟可以丢一次漂流瓶，默认3分钟
const getCDTime = `5` //每几分钟可以捞一次漂流瓶，默认5分钟
const driftBottleNumber = `3` //json文件中少于等于几个漂流瓶不能捞?默认3个
/** 丢漂流瓶屏蔽类配置 */
const isImageAllow = true //是否允许漂流瓶内容带图片, true是 flase否 默认true
const isImageToLink = true //是否转图片为链接, true是 flase否 默认true
const isBlackContent = true //是否启用屏蔽词, true是 flase否 默认true
const blackContent = [`cnm`, `操你妈`, `rnm`] //屏蔽词列表
const isWebLink = false //是否屏蔽网址, true是 flase否 默认false ！注意：需要启用屏蔽词作为前置否则不会屏蔽网址,并且开启此功能可能会误杀带内容"."的漂流瓶！
/** 文本类配置 */
const noImageContent = `不许把图片放进漂流瓶！` //如果有图片警告的文字，默认`不许把图片放进漂流瓶！`
const noContentContent = `你还没有写入任何想丢的内容哦~` //如果没有附带内容提醒的文字，默认`你还没有写入任何想丢的内容哦~`
const throwContent = `漂流瓶随诗歌流向远方了喔~` //丢漂流瓶附带的文字，默认`漂流瓶随诗歌流向远方了喔~`
const blockContent = `你的漂流瓶违规了！修改一下再扔吧~` //丢漂流瓶如果触碰到违禁词提醒的文字，默认`你的漂流瓶违规了！修改一下再扔吧~`
const getContent = `幸运的你从海边捡到了一个漂流瓶~` //捞漂流瓶附带的文字，默认`幸运的你从海边捡到了一个漂流瓶~`
const lessDriftBottleContent = `海中的漂流瓶不够喔(少于或等于${driftBottleNumber}个)~怎么捞都捞不到~` //如果漂流瓶过少附带的文字，默认`海中的漂流瓶不够喔(少于或等于${driftBottleNumber}个)~怎么捞都捞不到~`
const frontDriftBottleNumberContent = `海告诉我海里的漂流瓶有` //查询漂流瓶数量的前置文字，默认`海告诉我海里的漂流瓶有`
const backDriftBottleNumberContent = `个哦~` //查询漂流瓶数量的后置文字，默认`个哦~`

/*
更新日志
v0.5.4 QQBot Button按钮callback一律改input
v0.5.3 细节优化，调整返回内容位置
v0.5.2 细节优化
v0.5.1 查询漂流瓶数量
v0.5.0 适配图片
v0.4.1 更合理的CD冷却时间
v0.4.0 加入了QQBot Button按钮
v0.3.1 时间转换模块改moment
v0.3.0 细节优化，致敬TRSS
v0.2.0 加入了违禁词以及其他配置
v0.1.0 开发内测~
*/

/** 下面这些不用管 */
const throwCD = {}
const getCD = {}
const _path = process.cwd()

export class driftBottle extends plugin {
    constructor() {
        super({
            name: '[onlyJS]漂流瓶',
            dsc: '捡起或丢弃一个漂流瓶吧~',
            event: 'message',
            priority: 10,
            rule: [
                {
                    reg: '^#?(扔|丢)漂流瓶(.*)$',
                    fnc: 'throwDriftBottle'
                },
                {
                    reg: '^#?(捡|捞)?漂流瓶$',
                    fnc: 'getDriftBottle'
                },
                {
                    reg: '^#?(查询|获取)?漂流瓶(数|数量)$',
                    fnc: 'queryDriftBottleNumber'
                }
            ]
        })
    }
    async throwDriftBottle() {
        /** 判断文件夹及文件模块 */
        const resPath = path.join(`${_path}/resources`, `driftBottle`)
        const jsonPath = path.join(resPath, `driftBottle.json`)
        if (!fs.existsSync(resPath)) {
            fs.mkdirSync(resPath)
        }
        if (!fs.existsSync(jsonPath)) {
            fs.writeFileSync(jsonPath, JSON.stringify([]), 'utf8')
        }
        /** 内容模块 */
        if (!isImageAllow) {
            if (this.e.img) return this.e.reply([`${noImageContent}`, segment.button([
                { text: "丢漂流瓶", input: `#丢漂流瓶` },
                { text: "捞漂流瓶", input: `#捞漂流瓶` },
            ])])
        }
        const content = this.e.msg.replace(/#|扔|丢|漂流瓶/g, ``)
        if (!content && !this.e.img) return this.e.reply([`${noContentContent}`, segment.button([
            { text: "丢漂流瓶", input: `#丢漂流瓶` },
            { text: "捞漂流瓶", input: `#捞漂流瓶` },
        ])])
        /** 违禁词判断模块 */
        if (isBlackContent) {
            if (blackContent.includes(content)) return this.e.reply([`${blockContent}`, segment.button([
                { text: "丢漂流瓶", input: `#丢漂流瓶` },
                { text: "捞漂流瓶", input: `#捞漂流瓶` },
            ])])
            if (isWebLink) {
                let regTest = /((https?:\/\/)?[^\s]+\.[^\s]+)/
                if (regTest.test(content)) return this.e.reply([`${blockContent}`], segment.button([
                    { text: "丢漂流瓶", input: `#丢漂流瓶` },
                    { text: "捞漂流瓶", input: `#捞漂流瓶` },
                ]))
            }
        }
        /** 冷却模块 */
        if (throwCD[this.e.user_id] && !this.e.isMaster) {
            this.e.reply(['每' + throwCDTime + '分钟只能丢一次漂流瓶哦！', segment.button([
                { text: "丢漂流瓶", input: `#丢漂流瓶` },
                { text: "捞漂流瓶", input: `#捞漂流瓶` },
            ])])
        }
        throwCD[this.e.user_id] = true
        throwCD[this.e.user_id] = setTimeout(() => {
            if (throwCD[this.e.user_id]) delete throwCD[this.e.user_id]
        }, throwCDTime * 60 * 1000)
        /** 时间处理模块 */
        let formattedDate = moment().format('YYYY.MM.DD HH:mm:ss')
        /** 写入json模块 */
        let data = JSON.parse(fs.readFileSync(jsonPath, 'utf8'))
        if (this.e.img) {
            data.push({ content: content, date: formattedDate, imglink: this.e.img })
        } else {
            data.push({ content: content, date: formattedDate })
        }
        fs.writeFileSync(jsonPath, JSON.stringify(data, null, 2), 'utf8')
        if (content && !this.e.img) {
            await this.e.reply([`${throwContent}\n其中内容：${content}\n丢弃时间：${formattedDate}`, segment.button([
                { text: "丢漂流瓶", input: `#丢漂流瓶` },
                { text: "捞漂流瓶", input: `#捞漂流瓶` },
            ])])
        } else if (!content && this.e.img) {
            if (isImageToLink) {
                await this.e.reply([`${throwContent}\n附带图片：${this.e.img}\n丢弃时间：${formattedDate}`, segment.button([
                    { text: "丢漂流瓶", input: `#丢漂流瓶` },
                    { text: "捞漂流瓶", input: `#捞漂流瓶` },
                ])])
            } else {
                await this.e.reply([`${throwContent}\n附带图片：`, segment.image(`${this.e.img}`), `\n丢弃时间：${formattedDate}`, segment.button([
                    { text: "丢漂流瓶", input: `#丢漂流瓶` },
                    { text: "捞漂流瓶", input: `#捞漂流瓶` },
                ])])
            }
        } else if (content && this.e.img) {
            if (isImageToLink) {
                await this.e.reply([`${throwContent}\n其中内容：${content}\n附带图片：${this.e.img}\n丢弃时间：${formattedDate}`, segment.button([
                    { text: "丢漂流瓶", input: `#丢漂流瓶` },
                    { text: "捞漂流瓶", input: `#捞漂流瓶` },
                ])])
            } else {
                await this.e.reply([`${throwContent}\n其中内容：${content}\n附带图片：`, segment.image(`${this.e.img}`), `${formattedDate}`, segment.button([
                    { text: "丢漂流瓶", input: `#丢漂流瓶` },
                    { text: "捞漂流瓶", input: `#捞漂流瓶` },
                ])])
            }
        }
        return true
    }
    async getDriftBottle() {
        const resPath = path.join(`${_path}/resources`, `driftBottle`)
        const jsonPath = path.join(resPath, `driftBottle.json`)
        if (!fs.existsSync(resPath)) {
            fs.mkdirSync(resPath)
        }
        if (!fs.existsSync(jsonPath)) {
            fs.writeFileSync(jsonPath, JSON.stringify([]), 'utf8')
        }
        /** 冷却模块 */
        if (getCD[this.e.user_id] && !this.e.isMaster) {
            this.e.reply(['每' + getCDTime + '分钟只能捞一次漂流瓶哦！', segment.button([
                { text: "丢漂流瓶", input: `#丢漂流瓶` },
                { text: "捞漂流瓶", input: `#捞漂流瓶` },
            ])])
            return true
        }
        getCD[this.e.user_id] = true
        getCD[this.e.user_id] = setTimeout(() => {
            if (getCD[this.e.user_id]) delete getCD[this.e.user_id]
        }, getCDTime * 60 * 1000)
        /** 检测模块 */
        let data = JSON.parse(fs.readFileSync(jsonPath, 'utf8'))
        if (data.length <= `${driftBottleNumber}` || data.length === 0) {
            await this.e.reply([`${lessDriftBottleContent}`, segment.button([
                { text: "丢漂流瓶", input: `#丢漂流瓶` },
                { text: "查询数量", input: `#漂流瓶数量` },
            ])])
            return true
        }
        /** 随机模块 */
        let randomIndex = Math.floor(Math.random() * data.length)
        let selectedItem = data[randomIndex]
        /** 处理模块 */
        if (selectedItem.imglink && selectedItem.content) {
            if (isImageToLink) {
                await this.e.reply([
                    `${getContent}\n其中内容：${selectedItem.content}\n附带图片：${selectedItem.imglink}\n丢弃时间：${selectedItem.date}`,
                    segment.button([
                        { text: "丢漂流瓶", input: `#丢漂流瓶` },
                        { text: "捞漂流瓶", input: `#捞漂流瓶` },
                    ])
                ])
            } else {
                await this.e.reply([
                    `${getContent}\n其中内容：${selectedItem.content}\n附带图片：`, segment.image(`${selectedItem.imglink}`), `\n丢弃时间：${selectedItem.date}`,
                    segment.button([
                        { text: "丢漂流瓶", input: `#丢漂流瓶` },
                        { text: "捞漂流瓶", input: `#捞漂流瓶` },
                    ])
                ])
            }
        } else if (selectedItem.imglink) {
            if (isImageToLink) {
                await this.e.reply([
                    `${getContent}\n附带图片：${selectedItem.imglink}\n丢弃时间：${selectedItem.date}`,
                    segment.button([
                        { text: "丢漂流瓶", input: `#丢漂流瓶` },
                        { text: "捞漂流瓶", input: `#捞漂流瓶` },
                    ])
                ])
            } else {
                await this.e.reply([
                    `${getContent}\n附带图片：`, segment.image(`${selectedItem.imglink}`), `\n丢弃时间：${selectedItem.date}`,
                    segment.button([
                        { text: "丢漂流瓶", input: `#丢漂流瓶` },
                        { text: "捞漂流瓶", input: `#捞漂流瓶` },
                    ])
                ])
            }
        } else {
            await this.e.reply([
                `${getContent}\n其中内容：${selectedItem.content}\n丢弃时间：${selectedItem.date}`,
                segment.button([
                    { text: "丢漂流瓶", input: `#丢漂流瓶` },
                    { text: "捞漂流瓶", input: `#捞漂流瓶` },
                ])
            ])
        }
        /** 删除模块 */
        data.splice(randomIndex, 1)
        fs.writeFileSync(jsonPath, JSON.stringify(data, null, 2), 'utf8')
        return true
    }
    async queryDriftBottleNumber() {
        const resPath = path.join(`${_path}/resources`, `driftBottle`)
        if (!resPath) return this.e.reply([`不存在漂流瓶数据，请先使用#丢漂流瓶`,
            segment.button([
                { text: "丢漂流瓶", input: `#丢漂流瓶` },
                { text: "捞漂流瓶", input: `#捞漂流瓶` },
            ])
        ])
        const jsonPath = path.join(resPath, `driftBottle.json`)
        const data = JSON.parse(fs.readFileSync(jsonPath, 'utf8'))
        const realDriftBottleNumber = data.length
        await this.e.reply([`${frontDriftBottleNumberContent}`, `${realDriftBottleNumber}`, `${backDriftBottleNumberContent}`,
        segment.button([
            { text: "丢漂流瓶", input: `#丢漂流瓶` },
            { text: "捞漂流瓶", input: `#捞漂流瓶` },
        ])])
        return true
    }
}