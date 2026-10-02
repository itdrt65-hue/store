# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

- **Customers:** households, hotels and businesses in Palpa district, Nepal, who need an LPG cylinder refill. They arrive on a phone, want to know which cylinders are available and at what price, and then call to order.
- **Admin (the owner):** runs the admin panel personally, mostly on a phone, while taking orders by call or WhatsApp at the shop or on the move. The job is to log an order fast, move its status along, and keep an eye on stock.

## Product Purpose

A public site that presents Agrahari Gas, lists the cylinders it sells with live price and stock, and gets the visitor to call. Behind it, an admin panel to manage products, customers and orders. Success on the public side is a phone call; success on the admin side is an order logged or updated in a few taps.

## Positioning

A local LPG dealer for Palpa district, based in Tansen, ordered by a phone call rather than an online checkout.

## Operating Context

- Orders are placed by phone call or WhatsApp. There is no online ordering or payment.
- The owner enters each order into the admin panel by hand: customer, product, quantity, status.
- Order statuses: pending, confirmed, delivered, cancelled.
- A product counts as low stock below 5 units.

## Capabilities and Constraints

- Express 5 with server-rendered EJS templates, SQLite via Drizzle. No client-side framework and no build step for CSS or JS; forms submit with plain POST.
- Public pages: homepage (`/`) and 404. Admin pages: login, dashboard, products, orders, customers (list and form for each).
- Admin is a single shared login from `.env`.
- Site language is English.

## Brand Commitments

Only the name "Agrahari Gas" is fixed. Colors, type, logo treatment and layout are open.

## Evidence on Hand

- **Real:** the product list (name, description, price, stock), which is admin-managed and read from the database. The list of Palpa municipalities served is real geography.
- **Placeholder, confirmed by the owner (do not feature as fact):** "10+ years", the three customer quotes, "same-day delivery", "authorized/government-licensed dealer", "leak-tested", opening hours, the phone number (`+977-XX-XXXXXX`) and the email address.
- **Absent:** no logo file, no photography, no licence number, no real reviews.

## Product Principles

1. The phone call is the conversion. Every public screen keeps the number one tap away.
2. Show what is true today: live price and stock outrank marketing claims.
3. Admin is used one-handed on a phone, mid-call. Fewest taps wins.
4. Nothing unverified is presented as fact.
