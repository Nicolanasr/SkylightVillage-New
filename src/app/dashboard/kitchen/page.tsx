import React from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import KitchenDashboard from "@/components/KitchenDashboard";
import db from "@/lib/db";

export const revalidate = 0; // Live kitchen queue reload

export default async function KitchenPage() {
    const activeOrderItems = await db.orderItem.findMany({
        where: {
            status: {
                in: ["PENDING", "PREPARING", "READY"],
            },
        },
        include: {
            menuItem: true,
            order: {
                include: {
                    table: {
                        include: {
                            zone: true,
                        },
                    },
                },
            },
        },
        orderBy: {
            order: {
                createdAt: "desc",
            },
        },
    });

    return (
        <>
            <section className="px-4 md:px-8">
                <div className="container mx-auto max-w-7xl">
                    <KitchenDashboard initialItems={activeOrderItems} />
                </div>
            </section>
        </>
    );
}
