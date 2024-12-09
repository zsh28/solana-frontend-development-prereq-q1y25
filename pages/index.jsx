import React from 'react';
import Requirements from '../components/Requirements';
import ProjectCard from '../components/ProjectCard';
import { projects } from '../projects/projects';

const Index = () => {

    const [displayRequirements, setDisplayRequirements] = React.useState(false);

    return (
        <main className='bg-black text-white min-h-screen p-4'>
            <Requirements
                displayRequirements={displayRequirements}
                setDisplayRequirements={setDisplayRequirements}
            />
            <section className='flex flex-col gap-y-4 justify-center'>
            <div className='col-span-2 font-mono text-sm rounded-lg p-5 bg-zinc-800 w-full flex flex-col text-center items-center justify-center'>
                        <h1 className='text-xl sm:text-2xl md:text-3xl font-bold'>Turbin3 Frontend Course Prerequisites</h1>
                        <div>
                            by
                        <a href="https://twitter.com/sturt_jack" rel="noreferrer" target="_blank" className='my-4 text-zinc-400 hover:text-turbine-green transition-colors duration-200'> @sturt_jack</a> based on the work of 
                        <a href="https://twitter.com/_zebedee_" rel="noreferrer" target="_blank" className='my-4 text-zinc-400 hover:text-turbine-green transition-colors duration-200'> @_zebedee_</a>

                        </div>
                        <p className='leading-6'>Completing these two micro projects is required in order to attend the Turbin3 Frontend Course. Note: you will likely need to airdrop yourself some SOL to test your projects.</p>
                        <a href="https://faucet.solana.com/" rel="noreferrer" target="_blank" className='my-4 text-zinc-400 hover:text-turbine-green transition-colors duration-200'> SOL FAUCET</a>
                        
                    </div>
                <div className='grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-7xl'>
                    {projects.map((project, index) => (
                        <ProjectCard
                            key={index}
                            index={index}
                            project={project}
                            displayRequirements={displayRequirements}
                            setDisplayRequirements={setDisplayRequirements}
                        />
                    ))}
                </div>
            </section>
        </main>
    );
};

export default Index;
