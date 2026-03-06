// ============================================================
// Wedding Invitation — Auto Text Script
// Cristina & Andrei, 26 Septembrie 2026
//
// HOW TO USE:
//   1. Open your invitation background in Photoshop
//      (the AI-generated image, or a blank 1240x1772px / 300dpi canvas)
//   2. File > Scripts > Browse > select this file
//   3. All text layers will be created automatically
//   4. Fine-tune positions by dragging layers as needed
//
// FONTS REQUIRED (install before running):
//   - Great Vibes (fonts.google.com)
//   - Playfair Display (fonts.google.com)
//   - Lato (fonts.google.com)
// ============================================================

#target photoshop

var doc = app.activeDocument;
var W = doc.width.as("px");
var H = doc.height.as("px");
var cx = W / 2; // horizontal center

// ---- Color helpers ----
function rgb(r, g, b) {
    var c = new SolidColor();
    c.rgb.red = r; c.rgb.green = g; c.rgb.blue = b;
    return c;
}

var BURGUNDY      = rgb(114, 47,  55);   // #722F37
var GOLD          = rgb(197, 150, 27);   // #C5961B
var FOREST_GREEN  = rgb(45,  74,  34);   // #2D4A22
var BURGUNDY_50   = rgb(185, 148, 151);  // #722F37 ~50% on ivory
var BURGUNDY_40   = rgb(196, 163, 165);  // #722F37 ~40% on ivory

// ---- Text layer helper ----
function addText(label, content, fontPostScript, sizePt, color, x, y, align, tracking) {
    var layer = doc.artLayers.add();
    layer.kind = LayerKind.TEXT;
    layer.name = label;

    var ti = layer.textItem;
    ti.contents        = content;
    ti.font            = fontPostScript;
    ti.size            = new UnitValue(sizePt, "pt");
    ti.color           = color;
    ti.tracking        = tracking || 0;
    ti.leading         = new UnitValue(sizePt * 1.2, "pt");
    ti.antiAliasMethod = AntiAlias.SHARP;

    switch (align) {
        case "center": ti.justification = Justification.CENTER; break;
        case "right":  ti.justification = Justification.RIGHT;  break;
        default:       ti.justification = Justification.LEFT;   break;
    }

    ti.position = [new UnitValue(x, "px"), new UnitValue(y, "px")];
    return layer;
}

// ---- Thin gold divider helper (via line shape) ----
function addDivider(yPos) {
    var layer = doc.artLayers.add();
    layer.name = "divider";
    doc.activeLayer = layer;

    var startX = cx - (W * 0.065);
    var endX   = cx + (W * 0.065);

    app.foregroundColor = GOLD;
    doc.selection.select([
        [startX, yPos],
        [endX,   yPos],
        [endX,   yPos + 1],
        [startX, yPos + 1]
    ]);
    doc.selection.fill(GOLD, ColorBlendMode.NORMAL, 100, false);
    doc.selection.deselect();
}

// ============================================================
// POSITIONS — based on 1240 x 1772 px document
// Scale proportionally if your document is different
// ============================================================
var scaleX = W / 1240;
var scaleY = H / 1772;

function sx(x) { return x * scaleX; }
function sy(y) { return y * scaleY; }

// ---- Create a group for organisation ----
var group = doc.layerSets.add();
group.name = "Invitation Text";
doc.activeLayer = group;

// ---- 1. Opener text ----
addText(
    "opener",
    "Cu inimile pline de bucurie, v\u0103 invit\u0103m la nunta noastr\u0103",
    "Lato-LightItalic",
    8, BURGUNDY_40,
    sx(cx), sy(195),
    "center", 0
);

// ---- 2. CRISTINA ----
addText(
    "name-cristina",
    "Cristina",
    "GreatVibes-Regular",
    60, BURGUNDY,
    sx(cx), sy(380),
    "center", 0
);

// ---- 3. Ampersand ----
addText(
    "ampersand",
    "&",
    "GreatVibes-Regular",
    22, GOLD,
    sx(cx), sy(468),
    "center", 0
);

// ---- 4. ANDREI ----
addText(
    "name-andrei",
    "Andrei",
    "GreatVibes-Regular",
    60, BURGUNDY,
    sx(cx), sy(620),
    "center", 0
);

// ---- 5. Date row: SÂMBĂTĂ ----
addText(
    "date-sambata",
    "S\u00c2MB\u0102T\u0102",
    "Lato-Light",
    7, BURGUNDY_50,
    sx(300), sy(735),
    "center", 220
);

// ---- 6. Date: 26 ----
addText(
    "date-26",
    "26",
    "PlayfairDisplay-Regular",
    48, FOREST_GREEN,
    sx(cx), sy(760),
    "center", 0
);

// ---- 7. Date row: SEPTEMBRIE ----
addText(
    "date-septembrie",
    "SEPTEMBRIE",
    "Lato-Light",
    7, BURGUNDY_50,
    sx(940), sy(735),
    "center", 220
);

// ---- 8. Divider ----
addDivider(sy(800));

// ---- 9. ALĂTURI NE VOR FI ----
addText(
    "label-alaturi",
    "AL\u0102TURI NE VOR FI",
    "Lato-Regular",
    6, GOLD,
    sx(cx), sy(845),
    "center", 320
);

// ---- 10. PĂRINȚII MIRESEI (label) ----
addText(
    "label-parinti-miresei",
    "P\u0102RIN\u021aII MIRESEI",
    "Lato-Regular",
    6, GOLD,
    sx(310), sy(900),
    "center", 200
);

// ---- 11. Bride's parents names ----
addText(
    "bride-parent-1",
    "Ilie \u0218iclovan",
    "PlayfairDisplay-Regular",
    11, BURGUNDY,
    sx(310), sy(950),
    "center", 0
);
addText(
    "bride-parent-2",
    "Elisabeta \u0218iclovan",
    "PlayfairDisplay-Regular",
    11, BURGUNDY,
    sx(310), sy(1000),
    "center", 0
);

// ---- 12. PĂRINȚII MIRELUI (label) ----
addText(
    "label-parinti-mirelui",
    "P\u0102RIN\u021aII MIRELUI",
    "Lato-Regular",
    6, GOLD,
    sx(930), sy(900),
    "center", 200
);

// ---- 13. Groom's parents names ----
addText(
    "groom-parent-1",
    "Nicolae Stoian",
    "PlayfairDisplay-Regular",
    11, BURGUNDY,
    sx(930), sy(950),
    "center", 0
);
addText(
    "groom-parent-2",
    "Iuliana Stoian",
    "PlayfairDisplay-Regular",
    11, BURGUNDY,
    sx(930), sy(1000),
    "center", 0
);

// ---- 14. Divider ----
addDivider(sy(1045));

// ---- 15. NAȘII label ----
addText(
    "label-nasii",
    "NA\u0218II",
    "Lato-Regular",
    6, GOLD,
    sx(cx), sy(1090),
    "center", 320
);

// ---- 16. Godparents ----
addText(
    "godparents",
    "Matei Liberis & Ioana Liberis",
    "PlayfairDisplay-Regular",
    14, BURGUNDY,
    sx(cx), sy(1145),
    "center", 0
);

// ---- 17. Divider ----
addDivider(sy(1185));

// ---- 18. CUNUNIA RELIGIOASĂ label ----
addText(
    "label-cununia",
    "CUNUNIA RELIGIOAS\u0102",
    "Lato-Regular",
    6, GOLD,
    sx(310), sy(1235),
    "center", 200
);

// ---- 19. Church name ----
addText(
    "church-name",
    "Parohia Romano Catolic\u0103 \u201eSf. Anton\u201d",
    "PlayfairDisplay-Italic",
    13, BURGUNDY,
    sx(310), sy(1300),
    "center", 0
);

// ---- 20. Church address ----
addText(
    "church-address",
    "Str. Magnoliei nr. 113, Bucure\u0219ti",
    "PlayfairDisplay-Regular",
    8, BURGUNDY_50,
    sx(310), sy(1365),
    "center", 0
);

// ---- 21. Church time ----
addText(
    "church-time",
    "26 Septembrie 2026 \u00b7 ora 16:00",
    "Lato-Light",
    7, BURGUNDY_40,
    sx(310), sy(1405),
    "center", 0
);

// ---- 22. RECEPȚIA label ----
addText(
    "label-receptia",
    "RECEP\u021aIA",
    "Lato-Regular",
    6, GOLD,
    sx(930), sy(1235),
    "center", 200
);

// ---- 23. Venue name ----
addText(
    "venue-name",
    "Zooma Paradisul Verde",
    "PlayfairDisplay-Italic",
    13, BURGUNDY,
    sx(930), sy(1300),
    "center", 0
);

// ---- 24. Venue address ----
addText(
    "venue-address",
    "Aleea Paradisul Verde 6, 077066 Ostratu",
    "PlayfairDisplay-Regular",
    8, BURGUNDY_50,
    sx(930), sy(1365),
    "center", 0
);

// ---- 25. Venue time ----
addText(
    "venue-time",
    "26 Septembrie 2026 \u00b7 ora 19:00",
    "Lato-Light",
    7, BURGUNDY_40,
    sx(930), sy(1405),
    "center", 0
);

// ---- 26. Confirmă prezența (above QR) ----
addText(
    "qr-label",
    "Confirm\u0103 prezen\u021ba",
    "Lato-Regular",
    6, GOLD,
    sx(cx), sy(1490),
    "center", 200
);

// ---- 27. URL (below QR) ----
addText(
    "qr-url",
    "wedding-liart-three.vercel.app",
    "Lato-Light",
    6, BURGUNDY_40,
    sx(cx), sy(1710),
    "center", 0
);

// ---- Done ----
alert(
    "Done! All " + group.artLayers.length + " text layers created.\n\n" +
    "QR CODE: Place your QR code image manually between\n" +
    "the 'Confirm\u0103 prezen\u021ba' label and the URL (~y 1520-1660).\n\n" +
    "Fine-tune layer positions by dragging in the Layers panel."
);
