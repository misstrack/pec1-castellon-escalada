const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

// 📁 Rutas (ajustadas a tu estructura actual)
const inputDir = path.join(__dirname, "../images");
const outputDir = path.join(__dirname, "../images/optimized");

// 📸 Extensiones soportadas
const supportedExtensions = [".jpg", ".jpeg", ".png", ".webp"];

// 📁 Crear carpeta si no existe
async function ensureDir(dirPath) {
  await fs.promises.mkdir(dirPath, { recursive: true });
}

// 🔍 Obtener todas las imágenes (recursivo)
async function getAllImageFiles(dir) {
  const entries = await fs.promises.readdir(dir, { withFileTypes: true });

  const files = await Promise.all(
    entries.map(async (entry) => {
      const fullPath = path.join(dir, entry.name);

      // 📁 Si es carpeta → recursividad
      if (entry.isDirectory()) {
        if (entry.name === "optimized") return [];
        return getAllImageFiles(fullPath);
      }

      // 📄 Si es archivo → comprobar extensión
      const ext = path.extname(entry.name).toLowerCase();
      return supportedExtensions.includes(ext) ? [fullPath] : [];
    })
  );

  return files.flat();
}

// 📦 Obtener info de ruta
function getRelativeOutputPaths(filePath) {
  const relativePath = path.relative(inputDir, filePath);
  const parsed = path.parse(relativePath);

  return {
    relativeDir: parsed.dir,
    baseName: parsed.name,
    ext: parsed.ext.toLowerCase(),
  };
}

// ⚙️ Optimizar imagen general
async function optimizeImage(filePath) {
  const { relativeDir, baseName } = getRelativeOutputPaths(filePath);
  const targetDir = path.join(outputDir, relativeDir);

  await ensureDir(targetDir);

  const webpOutput = path.join(targetDir, `${baseName}.webp`);

  const metadata = await sharp(filePath).metadata();

  let pipeline = sharp(filePath);

  // 🔽 Limitar tamaño máximo
  if (metadata.width && metadata.width > 1920) {
    pipeline = pipeline.resize({
      width: 1920,
      withoutEnlargement: true,
    });
  }

  // 🔄 Convertir a WebP
  await pipeline.webp({ quality: 82 }).toFile(webpOutput);

  console.log(`✔ Optimizada: ${webpOutput}`);
}

// 🖼️ Generar tamaños responsive para hero
async function generateHeroSizes(filePath) {
  const sizes = [640, 1024, 1600];
  const baseName = "hero";

  for (const width of sizes) {
    const outputFile = path.join(outputDir, `${baseName}-${width}.webp`);

    await sharp(filePath)
      .resize({ width, withoutEnlargement: true })
      .webp({ quality: 82 })
      .toFile(outputFile);

    console.log(`✔ Hero generado: hero-${width}.webp`);
  }
}

// 🚀 Función principal
async function run() {
  try {
    await ensureDir(outputDir);

    const files = await getAllImageFiles(inputDir);

    if (!files.length) {
      console.log("No se encontraron imágenes en src/assets/images");
      return;
    }

    console.log(`Encontradas ${files.length} imágenes\n`);

    for (const file of files) {
      await optimizeImage(file);

      // 🎯 Detectar imagen hero 
      if (file.includes("landscape-mountains-covered-snow")) {
        await generateHeroSizes(file);
      }
    }

    console.log("\nProceso completado.");
  } catch (error) {
    console.error("Error al optimizar imágenes:", error);
  }
}

run();