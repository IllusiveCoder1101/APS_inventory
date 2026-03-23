"""Seed script to populate the database with 100+ items per table."""
import sys
import os
import random
from datetime import date, timedelta

sys.path.insert(0, os.path.dirname(__file__))

from app.database import SessionLocal
from app.models import ConsolidatedItems, NonExpendableItems, ExpendableItems, ExpendableItemsIssue

random.seed(42)

db = SessionLocal()

try:
    # Clear existing data (order matters due to FKs)
    db.query(ExpendableItemsIssue).delete()
    db.query(NonExpendableItems).delete()
    db.query(ExpendableItems).delete()
    db.query(ConsolidatedItems).delete()
    db.commit()

    # =========================================================================
    # CONSOLIDATED ITEMS (120 items)
    # =========================================================================
    property_heads = [
        "Furniture & Fixtures", "IT Equipment", "Laboratory Equipment", "Sports Equipment",
        "Library Books", "Electrical Appliances", "Audio Visual Aids", "Motor Vehicles",
        "Medical Equipment", "Workshop Tools", "Kitchen Equipment", "Bedding & Linen",
        "Musical Instruments", "Gardening Tools", "Fire Safety Equipment", "CCTV & Security",
        "Stationery Machines", "Water Purifiers", "Gymnasium Equipment", "Sewing Machines",
        "Carpentry Tools", "Plumbing Equipment", "Painting Supplies", "Photography Equipment",
        "Camping Gear", "Swimming Pool Equipment", "Laundry Machines", "Cleaning Machines",
        "Stage & Drama Equipment", "NCC Equipment", "Scouts & Guides Gear", "Band Instruments",
        "Computers - Desktop", "Computers - Laptop", "Printers & Scanners", "Networking Gear",
        "Servers & Storage", "Projectors & Screens", "Smart Boards", "EPABX Systems",
        "Air Conditioners", "Water Coolers", "Generators", "Solar Panels",
        "Transformer & Stabilizer", "Welding Machines", "CNC Machines", "3D Printers",
        "Oscilloscopes", "Signal Generators", "Power Supplies - Lab", "Multimeters - Digital",
        "Chemical Apparatus", "Physics Apparatus", "Biology Apparatus", "Math Models",
        "Geography Models", "Language Lab Equipment", "Robotics Kits", "Drone Equipment",
        "Telescope Equipment", "Weather Station", "Soil Testing Kit", "Water Testing Kit",
        "First Aid Kits", "Stretchers & Beds", "Wheelchairs", "Blood Pressure Monitors",
        "Weighing Scales", "Height Measuring Stand", "Eye Testing Chart", "Dental Kit",
        "Cricket Equipment", "Football Equipment", "Hockey Equipment", "Basketball Equipment",
        "Volleyball Equipment", "Tennis Equipment", "Table Tennis Equipment", "Badminton Equipment",
        "Athletics Equipment", "Shooting Range Equipment", "Horse Riding Gear", "Rowing Equipment",
        "Boxing Equipment", "Wrestling Mats", "Judo Mats", "Karate Equipment",
        "Yoga Mats & Props", "Archery Equipment", "Fencing Equipment", "Skating Equipment",
        "Reference Books", "Textbooks Collection", "Periodicals & Journals", "Digital Library",
        "Maps & Charts", "Globes & Models", "Encyclopedia Sets", "Dictionary Collection",
        "Classroom Desks", "Classroom Chairs", "Teacher Tables", "Staff Room Furniture",
        "Hostel Furniture", "Mess Furniture", "Office Cabinets", "Display Boards",
        "Trophy Cabinets", "Notice Boards", "White Boards", "Green Boards",
        "Podiums & Lecterns", "Flag Posts", "Garden Benches", "Playground Equipment",
        "Swings & Slides", "See-Saw Equipment", "Climbing Frames", "Sand Pit Equipment",
    ]

    fund_types = ["GF", "SF"]
    consolidated = []
    for i, ph in enumerate(property_heads):
        prev_val = round(random.uniform(50000, 2000000), 2)
        purchases = round(random.uniform(0, prev_val * 0.3), 2)
        serv_pct = random.uniform(0.6, 0.95)
        serv_val = round(prev_val * serv_pct, 2)
        unsv_val = round(prev_val * (1 - serv_pct), 2)
        dep_val = round(prev_val * random.uniform(0.05, 0.25), 2)

        consolidated.append(ConsolidatedItems(
            property_head=ph,
            appendix=f"A{i+1}",
            fund_details=random.choice(fund_types),
            prev_year_value=prev_val,
            prev_year_purchases=purchases,
            serv_value=serv_val,
            unsv_value=unsv_val,
            dep_value=dep_val,
            remarks=f"Category for {ph.lower()}" if random.random() > 0.6 else None,
        ))

    db.add_all(consolidated)
    db.commit()
    print(f"Inserted {len(consolidated)} consolidated items")

    appendix_list = [f"A{i+1}" for i in range(len(property_heads))]

    # =========================================================================
    # EXPENDABLE ITEMS (120 items)
    # =========================================================================
    expendable_names = [
        "White Board Markers", "A4 Paper Reams", "Printer Cartridges", "Cleaning Liquid",
        "Dusters", "Chalk Boxes", "Stapler Pins", "Adhesive Tape", "Register Books",
        "Pen Refills", "Envelopes", "File Folders", "Rubber Bands", "Correction Fluid",
        "Broom Sticks", "Mop Heads", "Toilet Cleaner", "Hand Wash Liquid", "Paper Clips",
        "Binding Pins", "Carbon Paper", "Tracing Paper", "Graph Paper", "Drawing Sheets",
        "Sketch Pens", "Crayons Box", "Poster Colors", "Fevicol Bottles", "Scissors",
        "Paper Cutter Blades", "Stamp Pad Ink", "Ball Point Pens Blue", "Ball Point Pens Black",
        "Ball Point Pens Red", "Pencils HB", "Pencils 2B", "Erasers", "Sharpeners",
        "Geometry Box", "Scale 30cm", "Protractor Set", "Compass Set", "French Curves",
        "T-Square", "Drawing Board Clips", "Thumb Pins", "Push Pins", "Fevistik Glue",
        "Cellotape Rolls", "Masking Tape", "Double Sided Tape", "Packing Tape",
        "Bubble Wrap Rolls", "Newspaper Bundle", "Tissue Paper Rolls", "Paper Towels",
        "Garbage Bags Large", "Garbage Bags Small", "Phenyl Bottles", "Floor Cleaner",
        "Glass Cleaner", "Dettol Liquid", "Sanitizer Bottles", "Face Masks",
        "Disposable Gloves", "Cotton Rolls", "Bandage Rolls", "ORS Packets",
        "Paracetamol Strips", "Burnol Tubes", "Antiseptic Cream", "Eye Drops",
        "Chalk White", "Chalk Colored", "Whiteboard Eraser", "Blackboard Duster",
        "Attendance Register", "Stock Register", "Cash Book", "Log Book",
        "Visitors Register", "Guard Report Book", "Complaint Register", "Issue Register",
        "Lab Record Book", "Drawing File", "Project File", "Assignment Sheets",
        "Answer Booklets", "Rough Notebooks", "Practical Notebooks", "Ruled Notebooks",
        "Plain Notebooks", "Graph Notebooks", "Interleaf Notebooks", "Map Stencils",
        "Ink Bottles Blue", "Ink Bottles Black", "Ink Bottles Red", "Toner Cartridge Black",
        "Toner Cartridge Color", "Drum Unit", "Fuser Unit", "Paper Tray Roller",
        "USB Cables", "HDMI Cables", "LAN Cables Cat6", "Extension Boards",
        "Fuse Wire", "Electric Tape", "Cable Ties", "Battery AA",
        "Battery AAA", "Battery 9V", "CFL Bulbs", "LED Bulbs",
        "Tube Lights", "Table Lamp Bulbs", "Night Lamp Bulbs", "Candles",
        "Match Boxes", "Kerosene Oil", "Lubricant Oil", "Grease Tubes",
    ]
    units = ["Pcs", "Reams", "Ltrs", "Boxes", "Packets", "Rolls", "Bottles", "Strips", "Tubes", "Bundles", "Meters"]

    expendable = []
    for name in expendable_names:
        prev = random.randint(10, 500)
        purchased = random.randint(5, 200)
        utilized = random.randint(5, min(prev + purchased, 300))
        expendable.append(ExpendableItems(
            items=name,
            unit=random.choice(units),
            qty_prev_month=prev,
            purchase_curr_month=purchased,
            utilized_curr_month=utilized,
            remarks=f"Regular supply item" if random.random() > 0.7 else None,
        ))

    db.add_all(expendable)
    db.commit()
    print(f"Inserted {len(expendable)} expendable items")

    # Fetch ser_no values for FK references
    exp_items = db.query(ExpendableItems).order_by(ExpendableItems.ser_no).all()
    exp_ser_nos = [e.ser_no for e in exp_items]

    # =========================================================================
    # NON-EXPENDABLE ITEMS - GOV FUNDED (120 items)
    # =========================================================================
    gf_nomenclatures = [
        "Desktop Computer Dell Optiplex", "Desktop Computer HP ProDesk", "Desktop Computer Lenovo ThinkCentre",
        "Laptop Dell Latitude 15", "Laptop HP ProBook 450", "Laptop Lenovo ThinkPad E15",
        "HP LaserJet Pro M404", "Canon ImageClass MF244", "Epson L3250 Printer",
        "Brother DCP-T820DW", "Ricoh SP 210 Printer", "Xerox B210 Printer",
        "Steel Almirah 6ft", "Steel Almirah 5ft", "Steel Almirah 4ft",
        "Wooden Office Table 5x3", "Wooden Office Table 4x2.5", "Steel Office Table 5x3",
        "Split AC 1.5 Ton LG", "Split AC 2 Ton Daikin", "Split AC 1 Ton Voltas",
        "Window AC 1.5 Ton Blue Star", "Cassette AC 3 Ton", "Tower AC 2 Ton",
        "Epson Projector EB-X51", "BenQ Projector MH560", "Sony Projector VPL-EX455",
        "ViewSonic Projector PA503S", "Optoma Projector HD146X", "InFocus Projector IN119HDG",
        "Microscope Binocular Olympus", "Microscope Monocular", "Microscope Stereo Zoom",
        "Digital Microscope USB", "Electron Microscope Model", "Phase Contrast Microscope",
        "Ceiling Fan Crompton 48in", "Ceiling Fan Havells 56in", "Ceiling Fan Orient 48in",
        "Pedestal Fan Bajaj 16in", "Wall Fan Usha 16in", "Exhaust Fan 12in",
        "Staff Bus Ashok Leyland 42S", "Staff Bus Tata Starbus 36S", "Utility Vehicle Mahindra Bolero",
        "Ambulance Tata Winger", "Mini Bus Force Traveller 26S", "Motorcycle Hero Splendor",
        "UPS 2KVA Luminous", "UPS 3KVA APC", "UPS 5KVA Microtek",
        "UPS 1KVA Numeric", "UPS 10KVA Emerson", "Inverter 1.5KVA Su-Kam",
        "First Aid Box Large", "First Aid Box Medium", "First Aid Box Small",
        "BP Monitor Digital", "Stethoscope Littmann", "Weighing Scale Digital",
        "Water Cooler 40L Blue Star", "Water Cooler 80L Voltas", "Water Purifier RO Kent",
        "Water Purifier Aquaguard", "Water Dispenser Hot Cold", "Water Tank SS 500L",
        "Generator 5KVA Kirloskar", "Generator 15KVA Cummins", "Generator 25KVA Mahindra",
        "Solar Panel 330W Tata", "Solar Panel 440W Adani", "Solar Inverter 5KW",
        "CCTV Camera Dome CP Plus", "CCTV Camera Bullet Hikvision", "CCTV DVR 16Ch",
        "CCTV NVR 32Ch", "Biometric Attendance Machine", "Metal Detector Handheld",
        "Fire Extinguisher ABC 4Kg", "Fire Extinguisher CO2 2Kg", "Fire Alarm System Panel",
        "Smoke Detector Honeywell", "Fire Hose Reel", "Emergency Light LED",
        "Smart Board 75in Samsung", "Smart Board 65in LG", "Interactive Panel BenQ 86in",
        "Digital Podium Lecturn", "PA System Ahuja 100W", "PA System Bosch 200W",
        "Conference System Bosch", "Microphone Wireless Shure", "Speaker Column JBL",
        "Amplifier Ahuja TZA-2000", "Mixer Console Yamaha", "Sound Bar Samsung",
        "Desktop Monitor Dell 24in", "Desktop Monitor HP 22in", "Desktop Monitor LG 27in",
        "Server Rack 42U", "Network Switch 24 Port", "WiFi Access Point Cisco",
        "Router Cisco 2901", "Firewall Fortinet 60F", "NAS Storage Synology",
        "Scanner Flatbed Canon", "Scanner ADF HP", "Barcode Scanner Zebra",
        "EPABX System Matrix 48P", "IP Phone Cisco 7841", "Fax Machine Panasonic",
        "Oscilloscope Tektronix 100MHz", "Signal Generator Agilent", "Digital Multimeter Fluke",
        "Power Supply Variable 30V", "Function Generator 20MHz", "LCR Meter Digital",
        "Transformer 10KVA Step Down", "Stabilizer 5KVA Servo", "Distribution Board 12Way",
    ]

    ne_gf = []
    for i, nom in enumerate(gf_nomenclatures):
        qty = random.randint(1, 80)
        rate = round(random.uniform(1000, 500000), 2)
        serv = random.randint(max(0, qty - 10), qty)
        unsv = qty - serv
        ledger = qty
        ground = qty - random.randint(0, min(2, qty))

        ne_gf.append(NonExpendableItems(
            lp_no=1000 + i,
            nomenclature=nom,
            nonexpendable_type="gov",
            category_appendix=random.choice(appendix_list),
            a_u="S",
            vintage=date(2015, 1, 1) + timedelta(days=random.randint(0, 3650)),
            qty=qty,
            rate=rate,
            qty_ledger=ledger,
            qty_ground=ground,
            qty_serv=serv,
            qty_unsv=unsv,
            dep_value=round(random.uniform(5, 30), 2),
            remarks=None if random.random() > 0.3 else "Working condition good",
        ))

    db.add_all(ne_gf)
    db.commit()
    print(f"Inserted {len(ne_gf)} non-expendable GF items")

    # =========================================================================
    # NON-EXPENDABLE ITEMS - SCHOOL FUNDED (120 items)
    # =========================================================================
    sf_nomenclatures = [
        "Badminton Racket Yonex Set", "Badminton Racket Li-Ning Set", "Shuttlecock Box Mavis",
        "Cricket Kit SG Complete", "Cricket Kit SS Complete", "Cricket Bat English Willow",
        "Cricket Ball SG Test", "Cricket Stumps Wooden", "Cricket Helmet SG",
        "Football Nivia Storm Size5", "Football Adidas Tango", "Football Goal Post Steel",
        "Football Net Nylon", "Football Shin Guards", "Football Training Cones",
        "Hockey Stick Grays", "Hockey Ball Kookaburra", "Hockey Goal Post",
        "Hockey Net Polyester", "Hockey Shin Pads", "Hockey Gloves Pair",
        "Basketball Spalding Size7", "Basketball Molten Size7", "Basketball Ring Board",
        "Basketball Net Nylon", "Basketball Shoes Rack", "Basketball Score Board",
        "Volleyball Mikasa MVA200", "Volleyball Cosco Shot", "Volleyball Net Tournament",
        "Volleyball Post Steel", "Volleyball Knee Pads", "Volleyball Antenna Set",
        "Tennis Racket Wilson Pro", "Tennis Ball Can Penn", "Tennis Net Court",
        "Tennis Post Aluminum", "Table Tennis Table Stag", "Table Tennis Table Butterfly",
        "TT Racket Set Stiga", "TT Ball Box Nittaku", "TT Net Post Set",
        "Athletics Starting Block", "Athletics Hurdles Set", "Athletics Shot Put 7Kg",
        "Athletics Discus 2Kg", "Athletics Javelin 800g", "Athletics Relay Baton Set",
        "Athletics High Jump Mat", "Athletics Long Jump Board", "Athletics Stop Watch Digital",
        "Boxing Gloves Pair 12oz", "Boxing Punching Bag", "Boxing Ring Corner Pads",
        "Wrestling Mat 12x12", "Judo Mat 2x1m", "Karate Kit Complete",
        "Yoga Mat Premium", "Yoga Block Set", "Yoga Strap Set",
        "Library Shelf Wooden 6ft", "Library Shelf Steel 5ft", "Library Shelf Wall Mount",
        "Book Display Stand", "Magazine Rack", "Newspaper Stand",
        "Library Table 8 Seater", "Library Chair Cushioned", "Library Computer Desk",
        "Globe World Map 12in", "Globe Physical 16in", "Wall Map India Political",
        "Wall Map World Physical", "Wall Map India Physical", "Atlas Stand",
        "Workshop Lathe Machine HMT", "Workshop Lathe Machine Kirloskar", "Workshop Milling Machine",
        "Workshop Drill Press Pillar", "Workshop Drill Press Bench", "Workshop Grinder Bench",
        "Workshop Vice 6in", "Workshop Anvil 50Kg", "Workshop Tool Kit Complete",
        "Workshop Welding Set Arc", "Workshop Welding Set Gas", "Workshop Hacksaw Frame",
        "Smart Board Interactive 75in", "Smart Board Interactive 65in", "Smart Board Interactive 55in",
        "Digital Display Board 55in", "Document Camera Epson", "Visualizer WolfVision",
        "PA System Portable 50W", "PA System Fixed 150W", "Cordless Mic System",
        "Collar Mic Sennheiser", "Handheld Mic Shure SM58", "Karaoke System",
        "Piano Keyboard Yamaha P45", "Piano Keyboard Casio CTX", "Harmonium Double Reed",
        "Tabla Set Professional", "Guitar Acoustic Yamaha", "Guitar Classical Fender",
        "Drum Kit Pearl 5pc", "Violin 4/4 Stentor", "Flute Yamaha YFL222",
        "Sewing Machine Singer Heavy", "Sewing Machine Usha Janome", "Embroidery Machine Brother",
        "Knitting Machine", "Overlock Machine", "Cutting Table 8ft",
        "Camping Tent 4 Person", "Camping Tent 8 Person", "Sleeping Bag Quechua",
        "Trekking Pole Pair", "Compass Prismatic", "Binoculars 10x50",
        "Swimming Lane Divider 25m", "Swimming Starting Block", "Swimming Backstroke Flag",
        "Rowing Machine Concept2", "Exercise Cycle Schwinn", "Treadmill Commercial",
    ]

    ne_sf = []
    for i, nom in enumerate(sf_nomenclatures):
        qty = random.randint(1, 60)
        rate = round(random.uniform(500, 300000), 2)
        serv = random.randint(max(0, qty - 8), qty)
        unsv = qty - serv
        ledger = qty
        ground = qty - random.randint(0, min(2, qty))

        ne_sf.append(NonExpendableItems(
            lp_no=3000 + i,
            nomenclature=nom,
            nonexpendable_type="sch",
            category_appendix=random.choice(appendix_list),
            a_u="S",
            vintage=date(2015, 1, 1) + timedelta(days=random.randint(0, 3650)),
            qty=qty,
            rate=rate,
            qty_ledger=ledger,
            qty_ground=ground,
            qty_serv=serv,
            qty_unsv=unsv,
            dep_value=round(random.uniform(5, 30), 2),
            remarks=None if random.random() > 0.3 else "Condition satisfactory",
        ))

    db.add_all(ne_sf)
    db.commit()
    print(f"Inserted {len(ne_sf)} non-expendable SF items")

    # =========================================================================
    # EXPENDABLE ITEMS ISSUE (150 records)
    # =========================================================================
    issue_to = [
        "Admin Office", "Principal Office", "Vice Principal Office", "Accounts Section",
        "Exam Cell", "Computer Lab", "Physics Lab", "Chemistry Lab", "Biology Lab",
        "Library", "Staff Room", "Class 6A", "Class 6B", "Class 7A", "Class 7B",
        "Class 8A", "Class 8B", "Class 9A", "Class 9B", "Class 10A", "Class 10B",
        "Class 11 Sci", "Class 11 Com", "Class 12 Sci", "Class 12 Com",
        "Sports Room", "NCC Office", "Workshop", "Hostel Block A", "Hostel Block B",
        "Mess Kitchen", "Sick Bay", "Guard Room", "Despatch Section", "Store Room",
        "Music Room", "Art Room", "Craft Room", "Swimming Pool", "Gymnasium",
    ]

    issues = []
    start_date = date(2025, 1, 1)
    for i in range(150):
        d = start_date + timedelta(days=random.randint(0, 80))
        is_receive = random.random() < 0.4
        cat_id = random.choice(exp_ser_nos)

        if is_receive:
            issues.append(ExpendableItemsIssue(
                date=d,
                rv_iv=f"RV-{i+1:03d}",
                category_id=cat_id,
                whom_id_issue="NA",
                qty_received=random.randint(5, 100),
                qty_issued=0,
            ))
        else:
            issues.append(ExpendableItemsIssue(
                date=d,
                rv_iv="NA",
                category_id=cat_id,
                whom_id_issue=random.choice(issue_to),
                qty_received=0,
                qty_issued=random.randint(1, 50),
            ))

    db.add_all(issues)
    db.commit()
    print(f"Inserted {len(issues)} expendable issue records")

    print("\n--- Seed complete! ---")
    print(f"  Consolidated:       {len(consolidated)}")
    print(f"  Expendable:         {len(expendable)}")
    print(f"  Non-Expendable GF:  {len(ne_gf)}")
    print(f"  Non-Expendable SF:  {len(ne_sf)}")
    print(f"  Expendable Issues:  {len(issues)}")
    print(f"  TOTAL:              {len(consolidated) + len(expendable) + len(ne_gf) + len(ne_sf) + len(issues)}")

except Exception as e:
    db.rollback()
    print(f"Error: {e}")
    raise
finally:
    db.close()
