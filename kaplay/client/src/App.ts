import "./index.css";
import type { MyRoomState } from "server:rooms/schema/MyRoomState";
import kaplay, { type KAPLAYCtx } from "kaplay";
import { colyseusSDK } from "./core/colyseus";
import { createLobbyScene } from "./scenes/lobby";
import Button from "./shared/components/button";

// Initialize kaplay
export const k = kaplay({
	width: 1600,
	height: 1000,
	stretch: true,
	crisp: false,
	pixelDensity: 2,
	letterbox: true,
	background: "20252e"
});

// Create all scenes
createLobbyScene();

function promptForName(): string {
	let name;
	do {
		name = prompt("Enter your LoL name and tag (i.e. Hide on bush#KR1)");
	} while (name === null || name.length < 3);
	return name;
}

async function tryJoinRoom(k: KAPLAYCtx, roomId: string, userState: any) {
	try {
		const room = await colyseusSDK.joinById<MyRoomState>(roomId, userState);
		k.go("lobby", room);
	} catch (err) {
		console.error("Failed to join room:", err);
		location.replace(location.href.split("?")[0]);
	}
}

async function tryCreateRoom(k: KAPLAYCtx, userState: any) {
	try {
		const room = await colyseusSDK.create<MyRoomState>("my_room", userState);
		const newUrl = new URL(location.href);
		newUrl.searchParams.set("room_id", room.roomId);
		console.log("Writing", newUrl, "to history");
		history.pushState({}, "", newUrl);
		k.go("lobby", room);
	} catch (err) {
		console.error("Failed to create room:", err);
	}
}

async function main() {
	let name = localStorage.getItem("name");
	if (name === null) {
		name = promptForName();
		localStorage.setItem("name", name);
	}

	const text = k.add([
		k.pos(k.center().x, k.center().y - 40),
		k.anchor("center"),
		k.text(`Welcome ${name}`),
	]);

	const logoutButton = Button(
		k,
		{
			text: "Logout",
			x: 60,
			y: 40,
			size: 14,
			textColor: "#000000",
			background: "#ffffff",
			outlineColor: "#ffffff",
		},
		() => {
			console.log("logged out");
			localStorage.removeItem("name");
			location.replace(location.href.split("?")[0]);
		},
	);

	let roomId;
	const urlParams = new URLSearchParams(location.search);
	if (urlParams.has("room_id")) {
		roomId = urlParams.get("room_id");
		await tryJoinRoom(k, roomId, prepareUserState());
	}

	Button(
		k,
		{
			text: "Join lobby by ID",
			x: k.center().x,
			y: k.center().y + 20,
			size: 14,
			textColor: "#000000",
			background: "#ffffff",
			outlineColor: "#ffffff",
		},
		() => {
			roomId = prompt("Enter the room ID");
			tryJoinRoom(k, roomId, prepareUserState());
		},
	);
	Button(
		k,
		{
			text: "Create new",
			x: k.center().x,
			y: k.center().y + 80,
			size: 14,
			textColor: "#ffffff",
			background: "#e61a1a",
			outlineColor: "#9e1414",
		},
		() => {
			tryCreateRoom(k, prepareUserState());
		},
	);
	// room = await colyseusSDK.joinOrCreate<MyRoomState>("my_room", {
	//   name: "Ka",
	// });

	// text.text = "Success! sessionId: " + room.sessionId;

	// k.go("lobby", room);

	function prepareUserState() {
		return {
			nameTag: name,
			name: name?.split("#")[0] || "Anonymous",
		};
	}
}

main();
