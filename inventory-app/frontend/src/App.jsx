import './App.css'
import {createBrowserRouter} from 'react-router-dom'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Expendable_Items from './pages/Expendable_Items'
import Non_Expendable_Items_GF from './pages/Non_Expendable_Items_GF'
import Non_Expendable_Items_SF from './pages/Non_Expendable_Items_SF' 
import Expendable_Item from './pages/Expendable_Item'
import Non_Expendable_Item_GF from './pages/Non_Expendable_item_GF'
import Non_Expendable_Item_SF from './pages/Non_Expendable_item_SF'
import Consolidated_Items from './pages/Consolidated_Items'
import Consolidated_Item from './pages/Consolidated_Item'


const router =createBrowserRouter([
  {'path':'/',element:<Login/>},
  {'path':'/dashboard',element:<Dashboard/>},
  {'path':'/expendable-items',element:<Expendable_Items/>},
  {'path':'/expendable-items/:expendableItemID',element:<Expendable_Item/>},
  {'path':'/non-expendable-items-gf',element:<Non_Expendable_Items_GF/>},
  {'path':'/non-expendable-items-gf/:nonExpendableItemGFID',element:<Non_Expendable_Item_GF/>},
  {'path':'/non-expendable-items-sf',element:<Non_Expendable_Items_SF/>},
  {'path':'/non-expendable-items-sf/:nonExpendableItemSFID',element:<Non_Expendable_Item_SF/>},
  {'path':'/consolidated-items',element:<Consolidated_Items/>},
  {'path':'/consolidated-items/:consolidatedItemID',element:<Consolidated_Item/>},
])

export default router
