import { useRef } from 'react';
import { RawData } from '../types/pokemon';
import { playCryAudio, playHitAudio } from '../utils/audioManager'

interface PokemonDataProps {
    pokemonData: RawData
    runHit: (name:string, id:number, coordinates:number[]) => void;
}

export default function PokemonCell({pokemonData, runHit}: PokemonDataProps) {
    const cellRef = useRef<HTMLDivElement>(null);
    const bushSpritesRef = useRef<HTMLDivElement>(null);
    const pokemonSpriteRef = useRef<HTMLImageElement>(null);

    const delay = (ms:number) => new Promise(res => setTimeout(res, ms));

    function shakeBush() {
        cellRef.current?.classList.add('shake-active');

        setTimeout(() => {
            cellRef.current?.classList.remove('shake-active');
        }, 700);
    }

    function animatePokemonHit() {
        pokemonSpriteRef.current?.classList.add('hit');
        setTimeout(() => {
            pokemonSpriteRef.current?.classList.remove('hit');
        }, 1800);
    }

    async function hitPokemon() {
        let leftCellDistance:number = 0;
        let topCellDistance:number = 0;

        if (cellRef.current) {
            leftCellDistance = cellRef.current.getBoundingClientRect().x;
            topCellDistance = cellRef.current.getBoundingClientRect().y;
        }

        runHit(pokemonData.name, pokemonData.id, [leftCellDistance, topCellDistance]);
        await delay(700);
        
        playHitAudio();
        await delay(300);
        playCryAudio(pokemonData.id);
        animatePokemonHit();
    }

    //  =============================================== ONCLICK / LONG-PRESS EVENTS =======================================================
    
    const timerRef = useRef<number | null>(null);
    const isLongPress = useRef(false);

    function handleLongPress() {
        playCryAudio(pokemonData.id);
        shakeBush();
    }

    const handleTouchStart = () => {
        isLongPress.current = false;
        timerRef.current = window.setTimeout(() => {
            isLongPress.current = true;
            handleLongPress();
        }, 500);
    }

    const handleTouchEnd = () => {
        if (timerRef.current) {
            clearTimeout(timerRef.current);
            timerRef.current = null;
        }

        if (!isLongPress.current) {
            hitPokemon();
        }
    }

    const handleClick = (e: { preventDefault: () => void; }) => {
        if (isLongPress.current) {
            e.preventDefault();  // prevent onClick if it's long press
            isLongPress.current = false; 
        }
    }

    // ================================================= RUN EVERY RENDER ========================================================

    async function animateBush() {
        shakeBush();
        
        if (bushSpritesRef.current) {
            const bushSprites: HTMLImageElement[] = Array.from(bushSpritesRef.current.childNodes) as HTMLImageElement[];

            let lastBushSprite;
            let activeBushSprite = bushSprites[2];
            const indexPattern = [1, 0, 1, 2];

            for(let i=0; i<indexPattern.length; i++) {
                lastBushSprite = activeBushSprite;
                activeBushSprite = bushSprites[indexPattern[i]];
                lastBushSprite.classList.remove('show');
                activeBushSprite.classList.add('show');

                await delay(150);
            }
        }
    }

    function revealPokemon() {
        pokemonSpriteRef.current?.classList.add('reveal');

        setTimeout(() => {
            pokemonSpriteRef.current?.classList.remove('reveal');
        }, 3000);
    }

    setTimeout(animateBush, Math.floor(Math.random() * 500));
    setTimeout(revealPokemon, 800);

    return (
        <div ref={cellRef} 
            className='pokemon-cell' 
            onClick={handleClick}
            onTouchStart={handleTouchStart}
            onMouseDown={handleTouchStart}
            onTouchEnd={handleTouchEnd}
            onMouseUp={handleTouchEnd}
        >
            <div ref={bushSpritesRef} className="bush-sprites">
                <img className='bush-sprite' src="../../images/bush-1.webp" alt="" />
                <img className='bush-sprite' src="../../images/bush-2.webp" alt="" />
                <img className='bush-sprite show' src="../../images/bush-3.webp" alt="" />
            </div>
            <img ref={pokemonSpriteRef} className='pokemon-sprite' src={pokemonData.sprite} alt="pokemon" />
            <audio id={'audio-'+ pokemonData.id} src={pokemonData.cryAudio}></audio>
        </div>
    );
}
