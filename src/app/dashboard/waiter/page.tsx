import React from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WaiterDashboard from "@/components/WaiterDashboard";
import db from "@/lib/db";

export const revalidate = 0; // Live database revalidation on waiter actions

export default async function WaiterPage() {
    const tables = await db.restaurantTable.findMany({
        include: {
            zone: true,
            assignedStaff: true,
            orders: {
                include: {
                    items: {
                        include: {
                            menuItem: true,
                        },
                    },
                    invoices: true,
                },
            },
        },
        orderBy: { number: "asc" },
    });

    const staffList = await db.staff.findMany({
        where: { role: "WAITER" },
        orderBy: { name: "asc" },
    });

    return (
        <>
            <section className="px-4 md:px-8">
                <div className="container mx-auto max-w-7xl">
                    <WaiterDashboard initialTables={tables} staffList={staffList} />
                </div>
            </section>
        </>
    );
}
