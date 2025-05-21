# NestConfig: Centralized Configuration Service

---

## Description

**NestConfig** is a powerful NestJS application acting as a central hub for microservice configurations. It allows you to easily manage environment-specific settings (production, development, demo) for all your applications, streamlining your deployment process and eliminating the need for individual `.env` files.

---

## Features

* **Centralized Configuration:** Manage all your microservice configurations in one place, providing a single source of truth.
* **Environment-Specific Settings:** Effortlessly switch configurations based on the environment (e.g., `production`, `development`, `demo`).
* **Secure Access:** Integrates with **Microsoft Authentication** to ensure only authorized personnel can access and modify configurations.
* **User-Friendly Interface:** Provides an interface (e.g., web UI, dedicated API) for authorized users to select an application and environment to modify its settings.
* **Reduced `.env` Overhead:** Say goodbye to `.env` file sprawl! Your microservices no longer need to manage their own local configuration files.

---

## How It Works

This service provides an API endpoint where your microservices can retrieve their configurations. When an authorized user wants to change settings for a specific microservice, they first authenticate via **Microsoft Authentication**. Once authenticated, they can interact with the service, typically by:

1.  **Selecting the Microservice/App Name:** Choosing the application whose settings they wish to modify (e.g., "User Service", "Product Catalog").
2.  **Selecting the Environment:** Specifying the environment for which the changes apply (e.g., `production`, `development`, `demo`).

Once the selections are made, the user can then view and update the relevant configuration values, which are then immediately available to the connected microservices.

---

## Getting Started

### Prerequisites

Before you begin, ensure you have the following installed:

* Node.js (LTS version recommended)
* PostgreSQL

### Installation

1.  Clone this repository:
    ```bash
    git clone [YOUR_REPOSITORY_URL_HERE]
    cd nestconfig
    ```
2.  Install project dependencies:
    ```bash
    npm install
    ```
3.  **Database Setup:** Configure your PostgreSQL connection. You'll need to update the database connection configuration in your NestJS application (e.g., in a `data-source.ts` file, a database module configuration, or via environment variables).
4.  **Microsoft Authentication Setup:** You'll need to configure your Microsoft Azure AD application for authentication. This typically involves setting up environment variables for `CLIENT_ID`, `CLIENT_SECRET`, `TENANT_ID`, and `REDIRECT_URI`. Refer to the project's authentication module for specific setup instructions.

### Running the Application

To start the NestConfig service in development mode:

```bash
npm run start:dev
