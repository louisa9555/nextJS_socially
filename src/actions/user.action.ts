"use server";
import { prisma } from "@/lib/prisma";
import { auth, currentUser } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

// Create use in PostgrasDB if new user logged in
export async function syncUser() {
    try{
        const {userId} = await auth();
        const user = await currentUser();
        if (!userId || !user) return;

        // Check if user exists
        const existingUser = await prisma.user.findUnique({
            where:{
                clerkId:userId
            }
        })
        if (existingUser){
            return existingUser;
        }
        // Else
        const dbUser = await prisma.user.create({
            data: {
                clerkId: userId,
                name: `${user.firstName || ""} ${user.lastName || ""}`,
                username: user.username ?? user.emailAddresses[0].emailAddress.split("@")[0],
                email: user.emailAddresses[0].emailAddress,
                image: user.imageUrl
            }
        })
        // console.log("Created new user:", dbUser);
        return dbUser;
    } catch (error){
        console.log("Error in syncUser", error);
    }
}

export async function getUserByClerkId(clerkId: string) {
    try {
        const user = await prisma.user.findUnique({
            where: {
                clerkId
            }, include: {
                _count:{
                    select: {
                        followers: true,
                        following: true,
                        posts: true
                    }
                }
            }
        })
        return user;
    } catch (error) {
        console.log("Error in getUserByClerkId", error);
    }
}

export async function getDBUserId(){
    const { userId:clerkId } = await auth();
    if (!clerkId) return null;

    const user = await getUserByClerkId(clerkId);
    if (!user) throw Error("User not found");
    return user.id;
}

export async function getRandomUsers(){
    try {
        const userId = await getDBUserId();
        if (!userId) return [];

        // Get 3 random users, exclude ourselves & users that we already follow
        const randomUsers = await prisma.user.findMany({
            where:{
                AND: [
                    // {NOT: {id:userId}},
                    {
                        NOT: {
                            followers:{  // meaning: not followers.some.followerId = userId
                                some:{
                                    followerId: userId
                                }
                            }
                        }
                    }
                ]
            },
            // select the wanted data and count the followers numbers
            select:{
                id: true,
                name: true,
                username: true,
                image: true,
                _count:{
                    select:{
                        followers: true,
                    }
                }
            },
            take: 3
        })
        return randomUsers;
    } catch (error) {
        console.log("Error fetching random users", error);
        return [];
    }
}

export async function toggleFollow(targetUserId: string) {
    try {
        const userId = await getDBUserId();
        if (!userId) return;
        if (userId === targetUserId) throw new Error("You can't follow yourself");
        const existingFollow = await prisma.follows.findUnique({
            where:{
                followerId_followingId  : { // this way is used to find indexed value
                    followerId: userId,
                    followingId: targetUserId
                }
            }
        })

        if (existingFollow){
            // unfollow
            await prisma.follows.delete({
                where:{
                    followerId_followingId:{
                        followerId: userId,
                        followingId: targetUserId
                    }
                }
            })
        } else {
            // follow
            await prisma.$transaction([ // none or all type
                prisma.follows.create({
                    data:{
                        followerId: userId,
                        followingId: targetUserId
                    }
                }),
                prisma.notification.create({
                    data:{
                        type: "FOLLOW",
                        userId: targetUserId, // user bein followed will received the notification
                        creatorId: userId // user that follwing

                    }
                })
            ])
            revalidatePath("/");
            return {success:true}
        }
    } catch (error) {
        console.log("Error in toggleFollow", error);
        return {success:false, error: "Error toggling follow"};
    }
}