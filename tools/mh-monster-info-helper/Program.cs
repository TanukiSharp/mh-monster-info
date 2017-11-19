using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading;

namespace mh_monster_info_helper
{
    class Program
    {
        private static string inputFilename = Path.Combine(AppContext.BaseDirectory, "input.txt");

        private static string[] elements = new [] { "fire", "water", "thunder", "ice", "dragon" };

        static void Main(string[] args)
        {
            new Program().Run();
        }

        private void Run()
        {
            var fsw = new FileSystemWatcher(
                Path.GetDirectoryName(inputFilename),
                Path.GetFileName(inputFilename)
            );

            while (true)
            {
                if (Console.KeyAvailable)
                {
                    if (Console.ReadKey(true).Key == ConsoleKey.Escape)
                        break;
                }

                fsw.WaitForChanged(WatcherChangeTypes.Changed);
                ProcessInput();
                Console.WriteLine("Input processed");
            }
        }

        private void ProcessInput()
        {
            string[] lines;

            while (true)
            {
                try
                {
                    lines = File.ReadAllLines(inputFilename);
                    break;
                }
                catch
                {
                    Thread.Sleep(100);
                }
            }

            int[] output = new int[elements.Length];

            foreach (string line in lines.Select(x => x.Trim()).Where(x => x.Length > 0))
            {
                string[] parts = line.Split('\t');

                for (int i = 0; i < output.Length; i++)
                    output[i] += int.Parse(parts[i + 4]); // +4 to skip 'Body Part', 'Slash', 'Impact' and 'Shot'
            }

            var sb = new StringBuilder();

            sb.AppendLine("        \"weak\": {");

            var items = new List<string>();
            for (int i = 0; i < output.Length; i++)
            {
                if (output[i] > 0)
                    items.Add($"            \"{elements[i]}\": {output[i]}");
            }

            sb.Append(string.Join(",\n", items));
            sb.AppendLine();
            sb.AppendLine("        }");

            File.WriteAllText(Path.Combine(AppContext.BaseDirectory, "output.txt"), sb.ToString());
        }
    }
}
