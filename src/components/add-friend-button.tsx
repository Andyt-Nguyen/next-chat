"use client"
import { addFriendValidator } from '@/lib/validations/add-friend';
import axios from 'axios';
import { FC, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import Button from './ui/button';

interface AddFriendButtonProps {}

type FormData = z.infer<typeof addFriendValidator>;

const AddFriendButton: FC<AddFriendButtonProps> = () => {
	const [showSuccess, setShowSuccess] = useState<boolean>(false);
	const { register, handleSubmit, setError, formState } = useForm<FormData>({
		resolver: zodResolver(addFriendValidator),
	});

	const addFriend = async (email: string) => {
		try {
			const validatedEmail = addFriendValidator.parse({ email });
			await axios.post('/api/friends/add', {
				email: validatedEmail,
			});

			setShowSuccess(true);
		} catch (error) {
			if (error instanceof z.ZodError) {
				setError('email', { message: error.message });
				return;
			}

			if (error instanceof axios.AxiosError) {
				setError('email', { message: error.response?.data });
				return;
			}
			setError('email', { message: 'Something went wrong' });
		}
	};

	const onSubmit = (data: FormData) => {
		addFriend(data.email);
	};

	return (
		<form onSubmit={handleSubmit(onSubmit)} className="max-w-sm">
			<label
				htmlFor="email"
				className="block font-medium text-sm leading-6 text-gray-900"
			>
				Add Friend by E-mail
			</label>
			<div className="mt-2 flex gap-4">
				<input
					{...register('email')}
					type="text"
					className="block w-full rounded-md border-0 text-gray-900 py-1.5 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-grey-400 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
					placeholder="you@example.com"
				/>
				<Button>Add</Button>
			</div>
			<p className="mt-1 text-sm text-red-600">
				{formState.errors.email?.message}
			</p>
			{showSuccess && (
				<p className="mt-1 text-sm text-green-600">Friend request sent!</p>
			)}
		</form>
	);
};

export default AddFriendButton;