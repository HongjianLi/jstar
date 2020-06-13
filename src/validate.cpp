#include <vector>
#include <sstream>
#include <iostream>
#include <GraphMol/MolOps.h>
#include <GraphMol/FileParsers/MolSupplier.h>
#include <GraphMol/FileParsers/MolWriters.h>
#include <GraphMol/SmilesParse/SmilesParse.h>
#include <GraphMol/Substruct/SubstructMatch.h>
#include <GraphMol/FragCatalog/FragFPGenerator.h>
#include <GraphMol/Descriptors/MolDescriptors.h>
using namespace std;
using namespace RDKit;
using namespace RDKit::MolOps;
using namespace RDKit::Descriptors;

int main(int argc, char* argv[])
{
	// Read contents from standard input.
	stringstream ss;
	for (string line; getline(cin, line); ss << line << endl);

	// Create output streams.
	SDWriter writer(&cout);

	// Iterate the input molecules.
	SDMolSupplier sup(&ss, false, true, false, true); // takeOwnership, sanitize, removeHs, strictParsing. Setting removeHs=false is to keep hydrogens intact in the output molecules.
	while (!sup.atEnd())
	{
		// Try parsing the molecule.
		const unique_ptr<ROMol> qry_ptr(sup.next()); // Calling next() may print "ERROR: Could not sanitize molecule on line XXXX" to stderr.
		const auto& qryMol = *qry_ptr;

		// Get the number of heavy atoms, excluding hydrogens.
		const auto num_atoms = qryMol.getNumHeavyAtoms();

		// Ensure the molecule contains some heavy atoms.
		if (!num_atoms) return 2;

		// Ensure the number of heavy atoms obtained by SMARTS matching equals the number of heavy atoms obtained by getNumHeavyAtoms().
		const unique_ptr<ROMol> SubsetMol(reinterpret_cast<ROMol*>(SmartsToMol("[!#1]"))); // heavy
		vector<vector<pair<int, int>>> matchVect;
		SubstructMatch(qryMol, *SubsetMol, matchVect);
		const auto num_matches = matchVect.size();
		if (num_matches != num_atoms) return 3;

		// Ensure the removeHs() function can successfully sanitize and kekulize the molecule, avoiding "Can't kekulize mol."
		const unique_ptr<ROMol> qryMolNoH_ptr(removeHs(qryMol));
		const auto& qryMolNoH = *qryMolNoH_ptr;

		// Calculate canonical SMILES, molecular formula and descriptors using the molecule with hydrogens removed.
		qryMol.setProp<string>("canonicalSMILES", MolToSmiles(qryMolNoH)); // Default parameters are: const ROMol& mol, bool doIsomericSmiles = true, bool doKekule = false, int rootedAtAtom = -1, bool canonical = true, bool allBondsExplicit = false, bool allHsExplicit = false, bool doRandom = false. https://www.rdkit.org/docs/cppapi/namespaceRDKit.html#a3636828cca83a233d7816f3652a9eb6b
		qryMol.setProp<string>("molFormula", calcMolFormula(qryMolNoH));
		qryMol.setProp<unsigned int>("numAtoms", num_atoms);
		qryMol.setProp<unsigned int>("numHBD", calcNumHBD(qryMolNoH));
		qryMol.setProp<unsigned int>("numHBA", calcNumHBA(qryMolNoH));
		qryMol.setProp<unsigned int>("numRotatableBonds", calcNumRotatableBonds(qryMolNoH));
		qryMol.setProp<unsigned int>("numRings", calcNumRings(qryMolNoH));
		qryMol.setProp<double>("exactMW", calcExactMW(qryMolNoH));
		qryMol.setProp<double>("tPSA", calcTPSA(qryMolNoH));
		qryMol.setProp<double>("clogP", calcClogP(qryMolNoH));

		// Write molecule.
		writer.write(qryMol);
	}
}
