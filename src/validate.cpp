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

	// Construct a molecule supplier.
	SDMolSupplier sup(&ss, false, true, false, true); // takeOwnership, sanitize, removeHs, strictParsing

	// Ensure there is at least a molecule and the cursor is at the end.
	if (!sup.length() || !sup.atEnd()) return 1;

	// Try parsing the molecule.
	const unique_ptr<ROMol> qry_ptr(sup.next()); // Calling next() may print "ERROR: Could not sanitize molecule on line XXXX" to stderr.

	// Obtain a reference to the molecule.
	const auto& qryMol = *qry_ptr;

	// Get the number of heavy atoms, excluding hydrogens.
	const auto num_points = qryMol.getNumHeavyAtoms();

	// Ensure the molecule contains some heavy atoms.
	if (!num_points) return 2;

	// Ensure the number of heavy atoms obtained by SMARTS matching equals the number of heavy atoms obtained by getNumHeavyAtoms().
	const unique_ptr<ROMol> SubsetMol(reinterpret_cast<ROMol*>(SmartsToMol("[!#1]"))); // heavy
	vector<vector<pair<int, int>>> matchVect;
	SubstructMatch(qryMol, *SubsetMol, matchVect);
	const auto num_matches = matchVect.size();
	if (num_matches != num_points) return 3;

	// Ensure the removeHs() function can successfully sanitize and kekulize the molecule, avoiding "Can't kekulize mol."
	const unique_ptr<ROMol> qryMolNoH(removeHs(qryMol));

	// Calculate canonical SMILES.
	qryMol.setProp<string>("canonicalSMILES", MolToSmiles(*qryMolNoH)); // Default parameters are: const ROMol& mol, bool doIsomericSmiles = true, bool doKekule = false, int rootedAtAtom = -1, bool canonical = true, bool allBondsExplicit = false, bool allHsExplicit = false, bool doRandom = false. https://www.rdkit.org/docs/cppapi/namespaceRDKit.html#a3636828cca83a233d7816f3652a9eb6b
	qryMol.setProp<string>("molFormula", calcMolFormula(qryMol));
	qryMol.setProp<unsigned int>("numAtoms", num_points);
	qryMol.setProp<unsigned int>("numHBD", calcNumHBD(qryMol));
	qryMol.setProp<unsigned int>("numHBA", calcNumHBA(qryMol));
	qryMol.setProp<unsigned int>("numRotatableBonds", calcNumRotatableBonds(qryMol));
	qryMol.setProp<unsigned int>("numRings", calcNumRings(qryMol));
	qryMol.setProp<double>("exactMW", calcExactMW(qryMol));
	qryMol.setProp<double>("tPSA", calcTPSA(qryMol));
	qryMol.setProp<double>("clogP", calcClogP(qryMol));

	// Create output streams.
	SDWriter writer(&cout);
	writer.write(qryMol);
}
