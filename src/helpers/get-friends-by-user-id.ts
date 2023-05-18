import { fetchRedis } from './redis';

export const getFriendsByUserId = async (userId: string) => {
	// retrieve friends for current user
	const friendIds = (await fetchRedis(
		'smembers',
		`user:${userId}:friends`
	)) as string[];

	const friends = await Promise.all(
		friendIds.map(async (id) => {
			const friend = (await fetchRedis('get', `user:${id}`)) as string;
			const parseFriend: User = JSON.parse(friend);
			return parseFriend;
		})
	);

	return friends;
};
