import { Controller, Get, Response, Route, SuccessResponse, Tags } from "tsoa";
import type { IconResponse } from "../services/riotService";
import { getSummonerIconByNameTag } from "../services/riotService";

@Route("riot")
@Tags("Riot")
export class RiotController extends Controller {
	/**
	 * Get a summoner's profile icon by Riot name#tag (e.g. SummonerName#Tag)
	 */
	@Get("/icon/{nameTag}")
	@SuccessResponse("200", "OK")
	@Response("400", "Bad Request")
	@Response("404", "Not Found")
	@Response("502", "Upstream Error")
	public async getIcon(nameTag: string): Promise<IconResponse> {
		return await getSummonerIconByNameTag(nameTag);
	}
}