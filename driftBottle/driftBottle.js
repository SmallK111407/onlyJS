// 作者：曉K(https://gitee.com/SmallK111407)
import plugin from '../../lib/plugins/plugin.js'
import fs from 'fs/promises'
import fs_ from 'node:fs'
import path from 'path'
import moment from 'moment'

/** 数据类配置 */
const isGroupGetCD = false //是否以群为单位进行捞漂流瓶冷却,否则为个人为单位进行捞漂流瓶冷却 true是 false否 默认false
const throwCDTime = `3` //每几分钟可以丢一次漂流瓶，默认3分钟
const getCDTime = `5` //每几分钟可以捞一次漂流瓶，默认5分钟
const driftBottleNumber = `3` //json文件中少于等于几个漂流瓶不能捞?默认3个
/** 丢漂流瓶屏蔽类配置 */
const isImageAllow = true //是否允许漂流瓶内容带图片, true是 false否 默认true
const isImageToLink = true //是否转图片为链接, true是 false否 默认true
const isBlackContent = true //是否启用屏蔽词, true是 false否 默认true 请使用`#?漂流瓶(添加|删除)屏蔽词` 添加或删除屏蔽词
const isWebLink = false //是否屏蔽网址, true是 false否 默认false ！注意：需要启用屏蔽词作为前置否则不会屏蔽网址,并且开启此功能可能会误杀带内容"."的漂流瓶！
/** 文本类配置 */
const noImageContent = `不许把图片放进漂流瓶！` //如果有图片警告的文字，默认`不许把图片放进漂流瓶！`
const noContentContent = `你还没有写入任何想丢的内容哦~(不支持QQ表情！)` //如果没有附带内容提醒的文字，默认`你还没有写入任何想丢的内容哦~`
const throwContent = `漂流瓶随诗歌流向远方了喔~` //丢漂流瓶附带的文字，默认`漂流瓶随诗歌流向远方了喔~`
const blockContent = `你的漂流瓶违规了！修改一下再扔吧~` //丢漂流瓶如果触碰到违禁词提醒的文字，默认`你的漂流瓶违规了！修改一下再扔吧~`
const getContent = `幸运的你从海边捡到了一个漂流瓶~` //捞漂流瓶附带的文字，默认`幸运的你从海边捡到了一个漂流瓶~`
const lessDriftBottleContent = `海中的漂流瓶不够喔(少于或等于${driftBottleNumber}个)~怎么捞都捞不到~` //如果漂流瓶过少附带的文字，默认`海中的漂流瓶不够喔(少于或等于${driftBottleNumber}个)~怎么捞都捞不到~`
const frontDriftBottleNumberContent = `海告诉我海里的漂流瓶有` //查询漂流瓶数量的前置文字，默认`海告诉我海里的漂流瓶有`
const backDriftBottleNumberContent = `个哦~` //查询漂流瓶数量的后置文字，默认`个哦~`

/*
更新日志
v1.1.0 细节优化，屏蔽词改为单独文件存储
v1.0.1 修复部分特殊协议端无中生有换行符
v1.0.0 首个正式版发布，修复了换行不能识别的bug
============================================================================================
v0.6.2 修复了如果漂流瓶内容为[(丢|扔)漂流瓶]会被replace为空白的bug，修复屏蔽词
v0.6.1 细节优化
v0.6.0 新增`是否以群为单位进行捞漂流瓶冷却`的配置项
v0.5.6 定义按钮代码片段为函数，减少代码的重复
v0.5.5 优化代码片段
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
                    reg: '^#?(扔|丢)漂流瓶([^]*)$',
                    fnc: 'throwDriftBottle'
                },
                {
                    reg: '^#?(捡|捞)?漂流瓶$',
                    fnc: 'getDriftBottle'
                },
                {
                    reg: '^#?(查询|获取)?漂流瓶(数|数量)$',
                    fnc: 'queryDriftBottleNumber'
                },
                {
                    reg: '^#?漂流瓶(添加|删除)屏蔽词',
                    fnc: 'addOrDelBlackWord'
                }
                /* QQBot无法接收this.e.at,暂时废弃
                {
                    reg: '^#?漂流瓶(封禁|解禁)',
                    fnc: 'banOrUnbanSomeBody'
                }
                */
            ]
        })
        this.resPath = path.join(`${_path}/resources`, `driftBottle`)
        this.jsonPath = path.join(this.resPath, `driftBottle.json`)
        this.blackWordsPath = path.join(this.resPath, `blackWords.json`)
        // this.bannedUsersPath = path.join(this.resPath, `bannedUsers.json`)
    }

    async init() {
        if (!fs_.existsSync(this.resPath)) {
            await fs.mkdir(this.resPath)
        }
        if (!fs_.existsSync(this.jsonPath)) {
            await fs.writeFile(this.jsonPath, JSON.stringify([]), 'utf8')
        }
        if (!fs_.existsSync(this.blackWordsPath)) {
            await fs.writeFile(this.blackWordsPath, JSON.stringify([]), 'utf8')
        }
        /*
        if (!fs_.existsSync(this.bannedUsersPath)) {
            await fs.writeFile(this.bannedUsersPath, JSON.stringify([]), 'utf8')
        }
        */
    }
    async throwDriftBottle() {
        if (!isImageAllow) {
            if (this.e.img) return this.e.reply([`${noImageContent}`, Button()])
        }
        const content = this.e.msg.replace(/^(#扔漂流瓶|#丢漂流瓶)/g, ``)
        if (!content && !this.e.img) return this.e.reply([`${noContentContent}`, Button()])
        if (isBlackContent) {
            const blackWords = JSON.parse(await fs.readFile(`${_path}/resources/driftBottle/blackWords.json`, `utf-8`))
            if (blackWords.some(substring => content.includes(substring))) return this.e.reply([`${blockContent}`, Button()])
            if (isWebLink) {
                let regTest = /((https?:\/\/)?[^\s]+\.[^\s]+)/
                if (regTest.test(content)) return this.e.reply([`${blockContent}`, Button()])
            }
        }
        if (throwCD[this.e.user_id] && !this.e.isMaster) {
            this.e.reply(['每' + throwCDTime + '分钟只能丢一次漂流瓶哦！', Button()])
        }
        throwCD[this.e.user_id] = true
        throwCD[this.e.user_id] = setTimeout(() => {
            if (throwCD[this.e.user_id]) delete throwCD[this.e.user_id]
        }, throwCDTime * 60 * 1000)
        let formattedDate = moment().format('YYYY.MM.DD HH:mm:ss')
        let data = JSON.parse(await fs.readFile(this.jsonPath, 'utf8'))
        if (this.e.img) {
            data.push({ content: content, date: formattedDate, imglink: this.e.img })
        } else {
            data.push({ content: content, date: formattedDate })
        }
        await fs.writeFile(this.jsonPath, JSON.stringify(data, null, 2), 'utf8')
        if (content && !this.e.img) {
            await this.e.reply([`${throwContent}\n其中内容：${content}\n丢弃时间：${formattedDate}`, Button()])
        } else if (!content && this.e.img) {
            if (isImageToLink) {
                await this.e.reply([`${throwContent}\n附带图片：${this.e.img}\n丢弃时间：${formattedDate}`, Button()])
            } else {
                await this.e.reply([`${throwContent}\n附带图片：`, segment.image(`${this.e.img}`), `\n丢弃时间：${formattedDate}`, Button()])
            }
        } else if (content && this.e.img) {
            if (isImageToLink) {
                await this.e.reply([`${throwContent}\n其中内容：${content}\n附带图片：${this.e.img}\n丢弃时间：${formattedDate}`, Button()])
            } else {
                await this.e.reply([`${throwContent}\n其中内容：${content}\n附带图片：`, segment.image(`${this.e.img}`), `${formattedDate}`, Button()])
            }
        }
        return true
    }
    async getDriftBottle() {
        if (!isGroupGetCD) {
            if (getCD[this.e.user_id] && !this.e.isMaster) {
                this.e.reply(['每' + getCDTime + '分钟只能捞一次漂流瓶哦！', Button()])
                return true
            }
            getCD[this.e.user_id] = true
            getCD[this.e.user_id] = setTimeout(() => {
                if (getCD[this.e.user_id]) delete getCD[this.e.user_id]
            }, getCDTime * 60 * 1000)
        } else {
            if (getCD[this.e.group_id] && !this.e.isMaster) {
                this.e.reply(['本群每' + getCDTime + '分钟只能捞一次漂流瓶哦！', Button()])
                return true
            }
            getCD[this.e.group_id] = true
            getCD[this.e.group_id] = setTimeout(() => {
                if (getCD[this.e.group_id]) delete getCD[this.e.group_id]
            }, getCDTime * 60 * 1000)
        }
        let data = JSON.parse(await fs.readFile(this.jsonPath, 'utf8'))
        if (data.length <= `${driftBottleNumber}` || data.length === 0) {
            await this.e.reply([`${lessDriftBottleContent}`, segment.button([
                { text: "丢漂流瓶", input: `#丢漂流瓶` },
                { text: "查询数量", input: `#漂流瓶数量` },
            ])])
            return true
        }
        let randomIndex = Math.floor(Math.random() * data.length)
        let selectedItem = data[randomIndex]
        if (selectedItem.imglink && selectedItem.content) {
            if (isImageToLink) {
                await this.e.reply([
                    `${getContent}\n其中内容：${selectedItem.content}\n附带图片：${selectedItem.imglink}\n丢弃时间：${selectedItem.date}`,
                    Button()
                ])
            } else {
                await this.e.reply([
                    `${getContent}\n其中内容：${selectedItem.content}\n附带图片：`, segment.image(`${selectedItem.imglink}`), `\n丢弃时间：${selectedItem.date}`,
                    Button()
                ])
            }
        } else if (selectedItem.imglink) {
            if (isImageToLink) {
                await this.e.reply([
                    `${getContent}\n附带图片：${selectedItem.imglink}\n丢弃时间：${selectedItem.date}`,
                    Button()
                ])
            } else {
                await this.e.reply([
                    `${getContent}\n附带图片：`, segment.image(`${selectedItem.imglink}`), `\n丢弃时间：${selectedItem.date}`,
                    Button()
                ])
            }
        } else {
            await this.e.reply([
                `${getContent}\n其中内容：${selectedItem.content}\n丢弃时间：${selectedItem.date}`,
                Button()
            ])
        }
        data.splice(randomIndex, 1)
        await fs.writeFile(this.jsonPath, JSON.stringify(data, null, 2), 'utf8')
        return true
    }
    async queryDriftBottleNumber() {
        const data = JSON.parse(await fs.readFile(this.jsonPath, 'utf8'))
        const realDriftBottleNumber = data.length
        await this.e.reply([`${frontDriftBottleNumberContent}${realDriftBottleNumber}${backDriftBottleNumberContent}`,
        Button()])
        return true
    }
    async addOrDelBlackWord() {
        if (!this.e.isMaster) return false
        const blackWords = JSON.parse(await fs.readFile(this.blackWordsPath, 'utf8'))
        let result = false
        this.e.msg.replace(/^#?漂流瓶(添加|删除)屏蔽词(.*)$/, async (_, operation, wordsStr) => {
            const words = wordsStr.trim().split(/,|，|\|/).filter(word => word.trim() !== '')
            if (words.length === 0 || words.includes('')) {
                await this.e.reply('你还没有写入屏蔽词哦~', BlackButton())
                return true
            }
            if (operation === '添加') {
                this.addOrDel = true
                for (const word of words) {
                    if (!blackWords.includes(word)) {
                        blackWords.push(word)
                        result = true 
                    } else {
                        await this.e.reply([`部分或单个屏蔽词在列表中已存在！`, BlackButton()])
                        break
                    }
                }
            } else if (operation === '删除') {
                this.addOrDel = false
                for (const word of words) {
                    const index = blackWords.indexOf(word)
                    if (index > -1) {
                        blackWords.splice(index, 1)
                        result = true
                    } else {
                        await this.e.reply([`部分或单个屏蔽词在列表中不存在！`, BlackButton()])
                        break
                    }
                }
            }
        })
        await fs.writeFile(this.blackWordsPath, JSON.stringify(blackWords, null, 2), 'utf8')
        if (result) return await this.e.reply([`屏蔽词`, this.addOrDel ? `添加` : `删除`, `成功！`, BlackButton()])
        return true
    }
    /*
    async banOrUnbanSomeBody() {
        if (!this.e.isMaster) return false
        const bannedUsers = JSON.parse(await fs.readFile(this.bannedUsersPath, 'utf8'))
    }
    */
}
function Button() {
    return segment.button([
        { text: "丢漂流瓶", input: `#丢漂流瓶` },
        { text: "捞漂流瓶", input: `#捞漂流瓶` },
    ])
}
function BlackButton() {
    return segment.button([
        { text: "添加屏蔽词", input: `#漂流瓶添加屏蔽词` },
        { text: "删除屏蔽词", input: `#漂流瓶删除屏蔽词` },
    ])
}