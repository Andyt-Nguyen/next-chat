import { FC } from 'react';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { notFound } from 'next/navigation';
import { getFriendsByUserId } from '@/helpers/get-friends-by-user-id';
import { fetchRedis } from '@/helpers/redis';
import { chatHrefContructor } from '@/lib/utils';
import { ChevronRight } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
interface DashboardProps {}

const Dashboard = async () => {
	const session = await getServerSession(authOptions);
	if (!session) {
		return notFound();
	}

	const friends = await getFriendsByUserId(session.user.id);

	const friendsWithLastMessage = await Promise.all(
		friends.map(async (friend) => {
			const [lastMessageRaw] = (await fetchRedis(
				'zrange',
				`chat:${chatHrefContructor(session.user.id, friend.id)}:messages`,
				-1,
				-1
			)) as string[];

			
			return {
				...friend,
				lastMessage: JSON.parse(lastMessageRaw),
			};
		})
	);
	return (
		<div className="container py-12">
			<h1 className="font-bold text-5xl mb-8">Recent Chats</h1>
			{friendsWithLastMessage.length <= 0 ? (
				<p className="text-sm text-zinc-500">Noting to show here</p>
			) : (
				friendsWithLastMessage.map((friend) => (
					<div
						key={friend.id}
						className="relative bg-zinc-50 border-zinc-200 p-3 rouned-md"
					>
						<div className="absolute right-4 inset-y-0 flex items-center">
							<ChevronRight className="h-7 w-7 text-zinc-400" />
						</div>
						<Link
							href={`/dashboard/chat/${chatHrefContructor(
								session.user.id,
								friend.id
							)}`}
							className="relative sm:flex"
						>
							<div className="mb-4 flex-shrink-0 sm:mb-0 sm:mr-4">
								<div className="relative h-6 w-6">
									<Image
										referrerPolicy="no-referrer"
										className="rounded-full"
										alt={`${friend.name} profile picture`}
										src={friend.image}
										fill
									/>
								</div>
							</div>

							<div>
								<h4 className="text-large font-semibold">{friend.name}</h4>
								<p className="mt-1 max-w-md">
									<span className="text-zinc-400">
										{friend.lastMessage.senderId ? 'You: ' : ''}
									</span>
									{friend.lastMessage.text}
								</p>
							</div>
						</Link>
					</div>
				))
			)}
		</div>
	);
};

export default Dashboard;
