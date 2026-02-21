import { useState, useEffect } from 'react'
import { DataTable } from 'primereact/datatable'
import type {  DataTablePageEvent } from 'primereact/datatable'
import { Column } from 'primereact/column'
import type { Artwork, ApiResponse } from './types'
import SelectionOverlay from './SelectionOverlay'
import { Button } from 'primereact/button'

const ROWS_PER_PAGE = 10


function App() {


  //state variables to hold data- ata component remembers
  const [artworks, setArtworks] = useState<Artwork[]>([])
  const [totalRecords, setTotalRecords] = useState<number>(0)
  const [currentPage, setCurrentPage] = useState<number>(1)
  const [loading, setLoading] = useState<boolean>(false)
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set())
  const [selectedRows, setSelectedRows] = useState<Artwork[]>([])
  const [customCount, setCustomCount] = useState<number>(0)
  const [deselectedIds, setDeselectedIds] = useState<Set<number>>(new Set())


  //function fetches one page of data from the API
  const fetchArtworks = async (page: number) => {

    setLoading(true)
    const fields = 'id,title,place_of_origin,artist_display,inscription,date_start,date_end'
    const url =`https://api.artic.edu/api/v1/artworks?page=${page}&limit=${ROWS_PER_PAGE}&fields=${fields}`

    try {
      const response = await fetch(url)
      const json: ApiResponse = await response.json()
      setArtworks(json.data)
      setTotalRecords(json.pagination.total)
    } catch (error) {
      console.error('Error fetching artworks:', error)
    } finally {
      setLoading(false)
    }


  }
  // runs once when component first loads
  useEffect(() => {
      fetchArtworks(currentPage)
    }, [currentPage])

    useEffect(() => {
      const currentPageSelected = artworks.filter((artwork, index) => {

        const globaPosition = (currentPage - 1) * ROWS_PER_PAGE + index + 1 //calculate global position of this row

        const inCustomRange= customCount > 0 && globaPosition <= customCount

        const manuallySlected = selectedIds.has(artwork.id) 
        const manuallyDeselected = deselectedIds.has(artwork.id)

        return (inCustomRange || manuallySlected) && !manuallyDeselected
      })
      setSelectedRows(currentPageSelected)
    }, [ artworks, selectedIds, deselectedIds, customCount, currentPage])
   
    //runs when user clicks a page num in the table
    const onPageChange = (event: DataTablePageEvent) => {
      const newPage = event.page! + 1  //PrimeReact uses 0-based, API uses 1-based
      setCurrentPage(newPage)}

      const onSelectionChange = (e: { value: Artwork[] }) => {
        const nowSelected = e.value //row now checked on this page
        
        setSelectedIds(prev => {
          //copy the existing set so we don't mutate state directly
          const updatedSelected = new Set(prev)

          //goes through all rows currently visible on this page
          artworks.forEach((artwork, index) => {
            const isNowSelected = nowSelected.some(row => row.id === artwork.id)
            const globalPosition = (currentPage - 1) * ROWS_PER_PAGE + index + 1
            const inCustomRange = customCount > 0 && globalPosition <= customCount

          if(!inCustomRange){
            if(isNowSelected){
              updatedSelected.add(artwork.id)  //user checked this row
            } else {
              updatedSelected.delete(artwork.id) //user unchecked this row
            }
          }
          })

          // Note: IDs from other pages are untouced cause we only loop through `artworks` (current page rows)

          return updatedSelected
          
        })

        setDeselectedIds(prev => {
          const updatedDeselected = new Set(prev)

          artworks.forEach((artwork, index) => {
            const isNowSelected = nowSelected.some(row => row.id === artwork.id)
            const globalPosition = (currentPage - 1) * ROWS_PER_PAGE + index + 1
            const inCustomRange = customCount > 0 && globalPosition <= customCount

            if(inCustomRange && !isNowSelected){
              // row was in range, user unchecked it - track this override
              updatedDeselected.add(artwork.id) 
            }
            if(inCustomRange && isNowSelected){
              // row was in range, user re-checked it - remove from deselected
              updatedDeselected.delete(artwork.id) 
            }
          })

          return updatedDeselected
        })
      }

      const handleCustomSelect = (count: number) => {
        //reset any previous deselections - fresh custom selection starts clean
        setDeselectedIds(new Set())
        //set the count - the useEffect will handle the rest automatically
        setCustomCount(count)
      }

      const clearCustomSelection = () => {
        setCustomCount(0)
        setDeselectedIds(new Set())
      }

      const getTotalSelected = () => {
        if(customCount > 0){

          return customCount - deselectedIds.size + selectedIds.size
        }
        return selectedIds.size
      }

  return (
    <>
    <div style={{padding: '2rem'}}>
      <h1>Art Institute of Chicago</h1>

      <div style={{ 
        marginBottom:'1rem',
        display: 'flex',
        alignItems: 'center',
        gap: '1rem'
        }}>
          <SelectionOverlay totalRecords={totalRecords} onConfirm={handleCustomSelect} />
          {customCount > 0 && (
            <Button 
              label={`Clear Custom Selection (${customCount} rows)`}
              onClick={clearCustomSelection}
              icon="pi pi-times"
              severity="secondary"
            />
          )}
        <strong>{getTotalSelected()} rows selected</strong>
      </div>

      <DataTable 
        value={artworks}
        paginator
        paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport"
        currentPageReportTemplate="Showing {first} to {last} of {totalRecords} entries"
        rows={ROWS_PER_PAGE}
        totalRecords={totalRecords}
        lazy
        onPage={onPageChange}
        loading={loading}
        dataKey="id"
        tableStyle={{ minWidth: '60rem'}}
        first={ (currentPage - 1) * ROWS_PER_PAGE }
        selection={selectedRows}
        onSelectionChange={onSelectionChange}
        selectionMode="multiple"

        >
          <Column selectionMode="multiple" headerStyle={{ width: '3rem' }} />
          <Column field="title" header="Title" />
          <Column field="artist_display" header="Artist" />
          <Column field="place_of_origin" header="Place of Origin" />
          <Column field="inscription" header="Inscription" />
          <Column field="date_start" header="Date Start" />
          <Column field="date_end" header="Date End" />
        </DataTable>
    </div>
      
    </>
  )
}

export default App
