import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { CreatePlayerDto } from './dto/player.dto'
import { Player, PlayerDocument } from './player.schema'

@Injectable()
export class PlayerService {
	constructor(
		@InjectModel(Player.name) private palyerModel: Model<PlayerDocument>
	) {}

	async createPlayer(dto: CreatePlayerDto) {
		const createdPlayer = new this.palyerModel(dto)
		const player = await createdPlayer.save()

		return {
			status: 'success',
			player,
		}
	}

	async getAllPlayers() {
		const players = await this.palyerModel.find().exec()

		return {
			status: 'success',
			data: players,
		}
	}

	async getPlayerByTel(telephone: string) {
		const player = await this.palyerModel.findOne({ telephone }).lean()

		return player
	}

	async updateScore(id: string, score: number, mode: number) {
		if (![15, 30, 60].includes(mode)) {
			throw new Error('Некорректный режим игры')
		}

		const scoreField = `score${mode}` as 'score15' | 'score30' | 'score60'
		const player = await this.palyerModel.findById(id)

		if (!player) {
			throw new Error('Игрок не найден')
		}

		if (typeof player[scoreField] !== 'number' || score > player[scoreField]) {
			player[scoreField] = score
			await player.save()
		}

		const topPlayers = await this.palyerModel
			.find()
			.sort({ [scoreField]: -1 })
			.limit(10)
			.select(`login telephone ${scoreField}`)
			.lean()

		return topPlayers.map(p => ({
			login: p.login,
			telephone: p.telephone,
			score: p[scoreField],
		}))
	}

	async getTopPlayers(mode: number) {
		if (![15, 30, 60].includes(mode)) {
			throw new Error('Некорректный режим игры')
		}

		const scoreField = `score${mode}` as 'score15' | 'score30' | 'score60'
		const topPlayers = await this.palyerModel
			.find()
			.sort({ [scoreField]: -1 })
			.limit(10)
			.select(`login telephone ${scoreField}`)
			.lean()

		return topPlayers.map(p => ({
			login: p.login,
			telephone: p.telephone,
			score: p[scoreField],
		}))
	}
}
