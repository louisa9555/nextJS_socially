import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError } from "uploadthing/server";
import { auth } from "@clerk/nextjs/server";

const f = createUploadthing();

// const auth = (req: Request) => ({ id: "fakeId" }); // Fake auth function

export const ourFileRouter = {
  // define routes for different upload types
  postImage: f({
    image: {
      maxFileSize: "4MB",
      maxFileCount: 1,
    },
  })
    .middleware(async () => {
      // this code runs on your server before upload
      console.log("auth()...");
      const { userId } = await auth();
      console.log("User ID:", userId);
      if (!userId) throw new Error("Unauthorized");

      // whatever is returned here is accessible in onUploadComplete as `metadata`
      return { userId };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      try {
        return { fileUrl: file.ufsUrl };
      } catch (error) {
        console.error("Error in onUploadComplete:", error);
        throw error;
      }
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;

// import { auth } from "@clerk/nextjs/server";
// import { createUploadthing, type FileRouter } from "uploadthing/next";
// import { UploadThingError } from "uploadthing/server";

// const f = createUploadthing();


// // FileRouter for your app, can contain multiple FileRoutes
// export const ourFileRouter = {
//   // Define as many FileRoutes as you like, each with a unique routeSlug
//   imageUploader: f({
//     image: {
//       maxFileSize: "4MB",
//       maxFileCount: 1,
//     },
//   })
//     // Set permissions and file types for this FileRoute
//     .middleware(async () => {
//       // This code runs on your server before upload
//       const { userId } = await auth();

//       // If you throw, the user will not be able to upload
//       if (!userId) throw new UploadThingError("Unauthorized");

//       // Whatever is returned here is accessible in onUploadComplete as `metadata`
//       return { userId };
//     })
//     .onUploadComplete(async ({ metadata, file }) => {
//       try {
//         return { fileUrl: file.url };
//       } catch (error) {
//         console.error("Error in onUploadComplete:", error);
//         throw error;
//       }
//     }),
// } satisfies FileRouter;

// export type OurFileRouter = typeof ourFileRouter;
