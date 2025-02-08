import React, { useRef, useEffect, useState } from 'react';
import * as Matter from 'matter-js';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true };
  }
  componentDidCatch(error, errorInfo) {
    console.error("Error caught by ErrorBoundary: ", error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return <h1>Something went wrong.</h1>;
    }
    return this.props.children;
  }
}

const App = () => {
  const containerRef = useRef(null);
  const engineRef = useRef(null);
  const [input, setInput] = useState('');
  const [showHitboxes, setShowHitboxes] = useState(false);

  useEffect(() => {
    if (!containerRef.current) {
      console.error('Container not found!');
      return;
    }

    // Create Matter.js engine
    const engine = Matter.Engine.create();
    engineRef.current = engine;

    // Create renderer and append the canvas to our container
    const render = Matter.Render.create({
      element: containerRef.current,
      engine: engine,
      options: {
        width: window.innerWidth,
        height: window.innerHeight,
        wireframes: false, // We draw the letters manually
        background: '#333',
      },
    });

    // Create a static ground so letters have somewhere to land
    const ground = Matter.Bodies.rectangle(
      window.innerWidth / 2,
      window.innerHeight - 50,
      window.innerWidth,
      100,
      { isStatic: true, render: { fillStyle: '#555' } }
    );
    
    // Create vertical walls on the left and right edges of the screen
    const wallThickness = 50;
    const leftWall = Matter.Bodies.rectangle(
      -wallThickness / 2,
      window.innerHeight / 2,
      wallThickness,
      window.innerHeight,
      { isStatic: true, render: { fillStyle: '#555' } }
    );
    const rightWall = Matter.Bodies.rectangle(
      window.innerWidth + wallThickness / 2,
      window.innerHeight / 2,
      wallThickness,
      window.innerHeight,
      { isStatic: true, render: { fillStyle: '#555' } }
    );

    // Add ground and walls to the world
    Matter.World.add(engine.world, [ground, leftWall, rightWall]);

    // Run the renderer and engine runner
    Matter.Render.run(render);
    const runner = Matter.Runner.create();
    Matter.Runner.run(runner, engine);

    // Use the 'afterRender' event to draw our letters
    Matter.Events.on(render, 'afterRender', () => {
      const context = render.context;
      context.font = '60px Arial'; // updated font size for bigger letters
      context.fillStyle = 'white';

      engine.world.bodies.forEach((body) => {
        if (body.label && body.label.startsWith('LETTER_')) {
          context.save();
          // Translate and rotate the canvas to the body's position & angle
          context.translate(body.position.x, body.position.y);
          context.rotate(body.angle);
          context.textAlign = 'center';
          context.textBaseline = 'middle';
          // Draw the letter
          context.fillText(body.letter, 0, 0);
          context.restore();
        }
      });
    });

    // Cleanup on component unmount
    return () => {
      Matter.Render.stop(render);
      Matter.World.clear(engine.world);
      Matter.Engine.clear(engine);
      render.canvas.remove();
      render.textures = {};
    };
  }, []);

  // On form submit, create a physics body for each letter of the input string
  const handleSubmit = (e) => {
    e.preventDefault();
    const letters = input.split('');
    letters.forEach((letter, index) => {
      if (letter === ' ') return; // skip spaces
      // Random horizontal position; stagger vertically
      const x = Math.random() * window.innerWidth;
      const y = -50 - index * 40;
      const letterBody = Matter.Bodies.rectangle(x, y, 45, 50, { // smaller body size for smaller hitbox
        restitution: 1,    // Fully elastic bounce
        friction: 0.05,    // Lower friction for more bounce
        // Tag the body so we know to draw it as a letter later
        label: 'LETTER_' + letter,
        // Make the body visible with a red outline
        render: {
          fillStyle: 'transparent',
          strokeStyle: showHitboxes ? 'red' : 'transparent',
          lineWidth: 2,
        },
      });
      // Save the actual letter as a custom property
      letterBody.letter = letter;
      Matter.World.add(engineRef.current.world, letterBody);
    });
    setInput('');
  };

  // New function to reset dropped letters
  const handleReset = () => {
    const world = engineRef.current.world;
    world.bodies
      .filter(body => body.label && body.label.startsWith('LETTER_'))
      .forEach(body => Matter.World.remove(world, body));
  };

  // Toggle hitboxes visibility
  const toggleHitboxes = () => {
    setShowHitboxes(!showHitboxes);
    const world = engineRef.current.world;
    world.bodies
      .filter(body => body.label && body.label.startsWith('LETTER_'))
      .forEach(body => {
        body.render.strokeStyle = !showHitboxes ? 'red' : 'transparent';
      });
  };

  return (
    <ErrorBoundary>
      <div style={{ position: 'relative', width: '100vw', height: '100vh', overflow: 'hidden' }}>
        {/* Ensure the container has explicit width & height */}
        <div 
          ref={containerRef} 
          style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }} 
        />
        <form
          onSubmit={handleSubmit}
          style={{
            position: 'absolute',
            top: 20,
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 10,
          }}
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type something..."
            style={{ fontSize: '20px', padding: '10px' }}
          />
          <button type="submit" style={{ fontSize: '20px', padding: '10px' }}>
            Drop Letters
          </button>
          <button type="button" onClick={handleReset} style={{ fontSize: '20px', padding: '10px', marginLeft: '10px' }}>
            Reset Letters
          </button>
          <button type="button" onClick={toggleHitboxes} style={{ fontSize: '20px', padding: '10px', marginLeft: '10px' }}>
            Toggle Hitboxes
          </button>
        </form>
      </div>
    </ErrorBoundary>
  );
};

export default App;