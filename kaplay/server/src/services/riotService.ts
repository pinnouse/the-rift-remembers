/* eslint-disable @typescript-eslint/no-explicit-any */
const RIOT_KEY = process.env.RIOT_KEY || process.env.RIOT_API_KEY;

if (!RIOT_KEY) {
  console.warn(
    "RIOT_KEY is not set. Riot endpoints will fail without an API key."
  );
}

// Simple in-memory cache for DDragon version
let cachedDDragonVersion: string | null = null;
let ddragonFetchedAt = 0;
const DDRAGON_TTL = 1000 * 60 * 60 * 6; // 6 hours

async function getLatestDDragonVersion() {
  const now = Date.now();
  if (cachedDDragonVersion && now - ddragonFetchedAt < DDRAGON_TTL)
    return cachedDDragonVersion;

  try {
    const res = await fetch(
      "https://ddragon.leagueoflegends.com/api/versions.json"
    );
    if (!res.ok) throw new Error(`versions.json returned ${res.status}`);
    const versions = await res.json();
    if (Array.isArray(versions) && versions.length > 0) {
      cachedDDragonVersion = versions[0];
      ddragonFetchedAt = now;
      return cachedDDragonVersion;
    }
  } catch (err) {
    console.warn("Failed to fetch ddragon versions", err);
  }

  return cachedDDragonVersion || "13.18.1";
}

function parseNameTag(input: string): { name: string; tag: string } | null {
  if (!input) return null;
  const decoded = decodeURIComponent(input);
  const parts = decoded.split("#");
  if (parts.length !== 2) return null;
  const name = parts[0].trim();
  const tag = parts[1].trim();
  if (!name || !tag) return null;
  return { name, tag };
}

export interface IconResponse {
  profileIconId: number;
  iconUrl: string;
}

export async function getSummonerIconByNameTag(
  nameTag: string
): Promise<IconResponse> {
  const parsed = parseNameTag(nameTag || "");
  if (!parsed)
    throw {
      status: 400,
      message: "Invalid name#tag parameter. Expected format: name#tag",
    };

  const { name: gameName, tag: tagLine } = parsed;

  const accountUrl = `https://americas.api.riotgames.com/riot/account/v1/accounts/by-riot-id/${encodeURIComponent(
    gameName
  )}/${encodeURIComponent(tagLine)}?${RIOT_KEY}`;

  const headers = new Headers();
  headers.append("X-Riot-Token", RIOT_KEY);

  const accountResp = await fetch(accountUrl, {
    headers,
  });

  if (accountResp.status === 404)
    throw { status: 404, message: "Summoner not found" };
  if (!accountResp.ok) {
    const text = await accountResp.text().catch(() => "");
    console.warn("Riot account-v1 error", accountResp.status, text);
    throw { status: 502, message: "Failed to lookup summoner account" };
  }

  interface RiotAccountResponse {
    puuid?: string;
    [key: string]: unknown;
  }

  const accountData: RiotAccountResponse =
    (await accountResp.json()) as RiotAccountResponse;
  const puuid: string | undefined = accountData.puuid;
  if (!puuid)
    throw { status: 502, message: "Unexpected account response from Riot" };

  const summonerUrl = `https://na1.api.riotgames.com/lol/summoner/v4/summoners/by-puuid/${encodeURIComponent(
    puuid
  )}`;

  const summonerResp = await fetch(summonerUrl, {
    headers,
  });

  if (!summonerResp.ok) {
    const text = await summonerResp.text().catch(() => "");
    console.warn("Riot summoner-v4 error", summonerResp.status, text);
    throw { status: 502, message: "Failed to fetch summoner data" };
  }

  interface RiotSummonerResponse {
    profileIconId?: number;
    [key: string]: unknown;
  }

  const summonerData: RiotSummonerResponse =
    (await summonerResp.json()) as RiotSummonerResponse;
  const profileIconId: number | undefined = summonerData.profileIconId;
  if (typeof profileIconId !== "number")
    throw {
      status: 502,
      message: "Profile icon not available for this summoner",
    };

  const ddragonVersion = await getLatestDDragonVersion();
  const iconUrl = `https://ddragon.leagueoflegends.com/cdn/${ddragonVersion}/img/profileicon/${profileIconId}.png`;

  return { profileIconId, iconUrl };
}
