import React, { forwardRef, useRef } from 'react';
import { Product } from '../types';
import PriceTagCard from './PriceTagCard';

interface EditorViewProps {
    products: Product[];
    backgroundImage: string | null;
    onUpdateProduct: (product: Product) => void;
    onDeleteProduct: (productId: string) => void;
    onRepeatProduct: (product: Product) => void;
    onDuplicateProduct: (product: Product) => void;
    onCopyStyles: (product: Product) => void;
    isGeneratingPdf: boolean;
}

const EditorView = forwardRef<HTMLDivElement, EditorViewProps>(({ products, backgroundImage, onUpdateProduct, onDeleteProduct, onRepeatProduct, onDuplicateProduct, onCopyStyles, isGeneratingPdf }, ref) => {
    const internalRef = useRef<HTMLDivElement>(null);
    const totalItems = 14;
    const placeholders = Array.from({ length: totalItems - products.length }).map((_, i) => ({
        id: `placeholder-${i}`,
        title: '',
        subtitle: '',
        price: '',
        priceInt: '',
        priceDec: '',
        isPlaceholder: true,
        validFrom: '',
        validUntil: ''
    }));

    const allItems = [...products, ...placeholders];
    
    // Sincroniza o ref externo com o interno
    React.useImperativeHandle(ref, () => internalRef.current as HTMLDivElement);

    // Dimensões exatas de posicionamento para A4
    const printableAreaStyle: React.CSSProperties = {
        position: 'absolute',
        top: '3.097%',
        bottom: '3.097%',
        left: '4.238%',
        right: '4.238%',
    };

    return (
        <div
            ref={internalRef}
            id="a4-sheet"
            className="bg-white aspect-[210/297] w-full relative overflow-hidden shadow-xl"
            style={{
                backgroundImage: backgroundImage ? `url(${backgroundImage})` : 'none',
                backgroundSize: '100% 100%',
                backgroundRepeat: 'no-repeat',
                imageRendering: 'auto', 
                fontSize: '11px', // Tamanho fixo e seguro para manter a proporção correta na pré-visualização
            }}
        >
            <div 
                id="printable-area"
                className="absolute"
                style={printableAreaStyle}
            >
                <div className="relative w-full h-full">
                    {allItems.map((product, index) => {
                        const row = Math.floor(index / 2);
                        const col = index % 2;
                        const rowHeight = 100 / 7;
                        
                        // --- AJUSTE DE POSICIONAMENTO DA GRADE (LIMITES DOS CARDS) ---
                        let pixelOffset = 0;
                        
                        // Pedido: A partir do Card 03 (index 2), tudo desce mais 0.5px (total 1.5px)
                        if (index >= 2) pixelOffset += 1.5;
                        
                        // Correções finas acumuladas para compensar o arraste da impressora ao longo da folha
                        if (index >= 5) pixelOffset += 1;
                        if (index >= 8) pixelOffset += 3;
                        if (index >= 12) pixelOffset += 1;

                        const topPosition = pixelOffset !== 0 
                            ? `calc(${row * rowHeight}% + ${pixelOffset}px)` 
                            : `${row * rowHeight}%`;

                        const wrapperStyle: React.CSSProperties = {
                            position: 'absolute',
                            top: topPosition, 
                            left: `${col * 50}%`, // 2 colunas
                            width: '50%',
                            height: `${rowHeight}%`,
                        };

                        return (
                            <div key={product.id} style={wrapperStyle}>
                                <PriceTagCard
                                    product={product}
                                    index={index}
                                    onUpdate={onUpdateProduct}
                                    onDelete={onDeleteProduct}
                                    onRepeat={(productId) => {
                                        const productToRepeat = products.find(p => p.id === productId);
                                        if (productToRepeat) onRepeatProduct(productToRepeat);
                                    }}
                                    onDuplicate={(productId) => {
                                        const productToDuplicate = products.find(p => p.id === productId);
                                        if (productToDuplicate) onDuplicateProduct(productToDuplicate);
                                    }}
                                    onCopyStyles={(productId) => {
                                        const productToCopy = products.find(p => p.id === productId);
                                        if (productToCopy) onCopyStyles(productToCopy);
                                    }}
                                    isGeneratingPdf={isGeneratingPdf}
                                />
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
});

EditorView.displayName = 'EditorView';

export default EditorView;
