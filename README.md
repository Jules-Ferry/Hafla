# Base-REST-API

A robust, modular, and secure REST API boilerplate built with **Node.js** and **Express**.
It features a **recursive file loader** for routes and schemas, along with a powerful validation middleware using **Zod**.

## 🚀 Features

- **Automated Loading**: Recursively loads routes and validation schemas from the file system.
- **Strict Validation**: Request bodies and query parameters are validated using [Zod](https://zod.dev/) before reaching the controller.
- **Clean Architecture**: Separation of concerns with `Routes` (HTTP layer), `Services` (Business logic), and `Schemas` (Validation).
- **Security First**: Inputs are stripped of unknown fields automatically.
- **Custom Logger**: Integrated color-coded logging system for development and file logging for production.
- **Error Handling**: Standardized JSON error responses.

## 📦 Installation

1. **Clone the repository**
   ```bash
      git clone https://gitea.azures.fr/azures04/Base-REST-API.git
      cd Base-REST-API
   ```