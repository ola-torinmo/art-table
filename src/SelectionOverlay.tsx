import {useRef, useState} from 'react'
import { OverlayPanel } from 'primereact/overlaypanel'
import { Button } from 'primereact/button'
import { InputNumber } from 'primereact/inputnumber'

interface Props {
    totalRecords: number
    onConfirm: (count: number) => void
}

function SelectionOverlay({ totalRecords, onConfirm }: Props) {
  const overlayRef = useRef<OverlayPanel>(null)
  const [inputValue, setInputValue] = useState<number | null>(null)

  const handleConfirm = () => {
    if (!inputValue || inputValue <=0) {
        alert('Please enter a valid number')
        return
    }

     if (inputValue > totalRecords) {
    alert(`Only ${totalRecords} records exist`)
    return
  }

    onConfirm(inputValue)
    setInputValue(null)
    overlayRef.current?.hide()
  }

 

  return (
    <>
    <Button label="Custom Select" 
    icon="pi pi-list"
    onClick={(e) => overlayRef.current?.toggle(e)} />

    <OverlayPanel ref={overlayRef} >
        <div style={{padding:'0.5rem', gap: '1rem', display: 'flex', flexDirection: 'column'}}>
            <h3 style={{margin:0}}>Select rows</h3>
            <p style={{margin:0, color: '#666'}}>Enter how many rows to select from the beginning</p>

            <InputNumber 
                value={inputValue} 
                onValueChange={(e) => setInputValue(e.value ?? null)} 
                min={1} 
                max={totalRecords} 
                placeholder="Enter number....."
                style={{width: '100%'}}
            />

            <Button 
            label="Confirm" 
            onClick={handleConfirm}
            icon="pi pi-check"
            
            />
        </div>
    </OverlayPanel>
    </>
  )
}

export default SelectionOverlay