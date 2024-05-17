import prisma from "@/lib/prisma";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { z } from "zod";


//
export async function GET(request: Request) {// การตรวจสอบความถูกต้องของค่า parameter นั้นๆ ที่มาจาก URL.
    const user = await currentUser();
    if (!user) {
      redirect("/sign-in");
    }
  
    const { searchParams } = new URL(request.url);
    const paramType = searchParams.get("type");
    //กำหนดให้ type เป็น enum   "expense", "income" หรือ null
    const validator = z.enum(["expense", "income"]).nullable();
    //ตรวจสอบค่า paramType  ถูกต้องตามเงื่อนไขที่กำหนดหรือไม่ และเก็บผลลัพธ์ที่ได้ในตัวแปร queryParams 
    const queryParams = validator.safeParse(paramType);
    if (!queryParams.success) {
      return Response.json(queryParams.error, {
        status: 400,
      });
    }

    const type = queryParams.data;
    const categories =await prisma.category.findMany({
        where:{
            userId:user.id,
            ...(type && {type}),  // include type in the filters if it's defined 
        },
        orderBy:{
            name:"asc"
        },


    });
    return Response.json(categories);
}