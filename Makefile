CC=g++
BOOST_ROOT?=/usr/local
RDKIT_ROOT?=/usr/local

bin/validate: obj/validate.o
	${CC} -o $@ $^ -L${RDKIT_ROOT}/lib -lRDKitDescriptors -lRDKitFileParsers -lRDKitSubstructMatch -lRDKitSmilesParse -lRDKitGraphMol -lRDKitRDGeneral

obj/validate.o: src/validate.cpp
	${CC} -o $@ $< -c -std=c++17 -O2 -Wall -I${BOOST_ROOT}/include -I${RDKIT_ROOT}/include/rdkit

clean:
	rm -f bin/validate obj/*.o
