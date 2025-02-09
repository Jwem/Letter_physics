# Letters Physics

This project is a physics-based animation where letters drop and interact with the environment using the Matter.js physics engine.

## Features

- **Drop Letters:** Type text and drop letters that have physical properties.
- **Reset Letters:** Remove all dropped letters from the simulation.
- **Toggle Hitboxes:** Show or hide the hitboxes around the letters.
- **Pause/Resume Simulation:** Temporarily halt and resume the physics simulation.
- **Click Interaction:** Apply an outward force in a circular shape anywhere on the screen by clicking.
- **Customizable Commands:** Automated commands with anti-bot verification to manage purchases and upgrades.

## Setup and Usage

1. Ensure you have Node.js installed.
2. Navigate to the project folder:
   ```bash
   cd /./././Letter_physics
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Start the development server:
   ```bash
   npm start
   ```
5. Open your browser at [http://localhost:3000](http://localhost:3000) to view the simulation.

## Project Structure

- **src/app.js:** Main application file handling the simulation, user input, and interactions.
- **src/index.js:** Entry point for the React application.
- **src/index.html:** Basic HTML template including styles to match the simulation background.

Enjoy the simulation and experiment with interactive physics for letters!